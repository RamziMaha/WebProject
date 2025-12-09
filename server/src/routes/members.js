const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const { ListMember } = require('../models/associations');
const List = require('../models/List');
const User = require('../models/User');

const router = express.Router();

const listQuerySchema = z.object({
  listId: z
    .string()
    .refine((value) => /^\d+$/.test(value), 'listId must be numeric')
    .transform((value) => Number.parseInt(value, 10))
});

const memberCreateSchema = z.object({
  listId: z.number().int().positive(),
  userId: z.number().int().positive(),
  role: z.enum(['owner', 'member']).default('member')
});

const memberDeleteSchema = z.object({
  listId: z.number().int().positive(),
  userId: z.number().int().positive()
});

const inviteSchema = z.object({
  listId: z.number().int().positive(),
  emails: z.array(z.string().email()).min(1),
  role: z.enum(['owner', 'member']).default('member')
});

router.use(requireAuth);

async function ensureOwner(listId, userId) {
  const list = await List.findByPk(listId);
  if (!list) {
    return null;
  }
  if (list.owner_id !== userId) {
    throw new Error('FORBIDDEN');
  }
  return list;
}

router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const { listId } = req.query;

    const list = await ensureOwner(listId, req.user.id_user);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const members = await ListMember.findAll({
      where: { list_id: listId },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    res.json(
      members.map((member) => {
        const user = member.get('user');
        return {
          userId: member.getDataValue('user_id'),
          listId: member.getDataValue('list_id'),
          role: member.getDataValue('role'),
          user: user
            ? {
                id: user.id_user,
                email: user.email,
                name: user.name
              }
            : undefined
        };
      })
    );
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Only owner can manage members' });
      return;
    }
    next(error);
  }
});

router.post('/', validateBody(memberCreateSchema), async (req, res, next) => {
  try {
    const { listId, userId, role } = req.body;

    const list = await ensureOwner(listId, req.user.id_user);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [member, created] = await ListMember.findOrCreate({
      where: { list_id: listId, user_id: userId },
      defaults: { role }
    });

    if (!created) {
      member.set({ role });
      await member.save();
    }

    res.status(created ? 201 : 200).json({
      userId,
      listId,
      role: member.getDataValue('role')
    });
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Only owner can manage members' });
      return;
    }
    next(error);
  }
});

router.delete('/', validateBody(memberDeleteSchema), async (req, res, next) => {
  try {
    const { listId, userId } = req.body;

    const list = await ensureOwner(listId, req.user.id_user);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (userId === list.owner_id) {
      res.status(400).json({ error: 'Owner cannot be removed from the list' });
      return;
    }

    await ListMember.destroy({
      where: { list_id: listId, user_id: userId }
    });

    res.status(204).send();
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Only owner can manage members' });
      return;
    }
    next(error);
  }
});

// Invite members by email (existing users only)
router.post('/invite', validateBody(inviteSchema), async (req, res, next) => {
  try {
    const { listId, emails, role } = req.body;

    const list = await ensureOwner(listId, req.user.id_user);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const { Op } = require('sequelize');
    const users = await User.findAll({ where: { email: { [Op.in]: emails } } });
    const foundEmails = new Set(users.map((u) => u.email));
    const notFound = emails.filter((e) => !foundEmails.has(e));

    const invited = [];
    for (const u of users) {
      const [member] = await ListMember.findOrCreate({
        where: { list_id: listId, user_id: u.id_user },
        defaults: { role }
      });
      invited.push({ userId: u.id_user, email: u.email, role: member.getDataValue('role') });
    }

    res.status(200).json({ invited, notFound });
  } catch (error) {
    if ((error.message) === 'FORBIDDEN') {
      res.status(403).json({ error: 'Only owner can manage members' });
      return;
    }
    next(error);
  }
});

module.exports = router;
