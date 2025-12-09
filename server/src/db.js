const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'toodoz',
  DB_PORT = '3306'
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number.parseInt(DB_PORT, 10),
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true
  }
});

async function connectDatabase() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  connectDatabase
};
