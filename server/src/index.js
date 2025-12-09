const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const dotenv = require('dotenv');
const helmet = require('helmet');
const authRouter = require('./routes/auth');
const listsRouter = require('./routes/lists');
const tasksRouter = require('./routes/tasks');
const membersRouter = require('./routes/members');
const tagsRouter = require('./routes/tags');
const { connectDatabase, sequelize } = require('./db');
require('./models/User');
require('./models/Session');
require('./models/List');
require('./models/Task');
require('./models/Tag');
const { registerAssociations } = require('./models/associations');

dotenv.config();

const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);
const FRONT_ORIGIN = process.env.FRONT_ORIGIN ?? 'http://localhost:5173';

const app = express();

app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '1mb' }));

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});

app.use(csrfProtection);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/lists', listsRouter);
app.use('/tasks', tasksRouter);
app.use('/members', membersRouter);
app.use('/tags', tagsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  try {
    await connectDatabase();
    registerAssociations();
    await sequelize.sync({ alter: false });

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
