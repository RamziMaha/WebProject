const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { validateBody } = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');

const SESSION_DAYS = Number.parseInt(process.env.SESSION_DAYS ?? '7', 10);
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 * 1000;

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_MAX_AGE
};

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const isProd = process.env.NODE_ENV === 'production';
const loginLimiter = rateLimit({
  // Aggressive in production; lenient in development
  windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
  limit: isProd ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many login attempts. Please wait.' });
  }
});

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');

  return Session.create({
    user_id: userId,
    token,
    expire_at: new Date(Date.now() + SESSION_MAX_AGE),
    revoked_at: null
  });
}

function setSessionCookie(res, token) {
  res.cookie('sid', token, sessionCookieOptions);
}

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: passwordHash,
      name: name ?? null
    });

    const csrfToken = req.csrfToken();

    res.status(201).json({
      id: user.id_user,
      email: user.email,
      name: user.name,
      csrfToken
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const session = await createSession(user.id_user);
      setSessionCookie(res, session.token);

      const csrfToken = req.csrfToken();

      res.json({
        message: 'Logged in',
        user: {
          id: user.id_user,
          email: user.email,
          name: user.name
        },
        csrfToken
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    req.session.revoked_at = new Date();
    await req.session.save();
    res.clearCookie('sid', {
      ...sessionCookieOptions,
      maxAge: undefined
    });
    const csrfToken = req.csrfToken();
    res.json({ message: 'Logged out', csrfToken });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id_user,
      email: req.user.email,
      name: req.user.name
    }
  });
});

router.get('/csrf-token', (req, res) => {
  const token = req.csrfToken();
  res.json({ csrfToken: token });
});

module.exports = router;
