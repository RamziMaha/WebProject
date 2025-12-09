const { Op } = require('sequelize');
const Session = require('../models/Session');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.sid;

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const session = await Session.findOne({
      where: {
        token,
        revoked_at: { [Op.is]: null },
        expire_at: {
          [Op.gt]: new Date()
        }
      },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!session || !session.user) {
      res.status(401).json({ error: 'Invalid session' });
      return;
    }

    req.session = session;
    req.user = session.user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireAuth
};
