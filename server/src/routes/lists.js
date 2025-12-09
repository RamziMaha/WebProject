const express = require('express');
const { z } = require('zod');
const { validateBody, validateQuery } = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/auth');
const List = require('../models/List');
const { ListMember } = require('../models/associations');
const Task = require('../models/Task');
const User = require('../models/User');

const router = express.Router();

const listCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['personal', 'work', 'grocery', 'trip'])
});

const listUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['personal', 'work', 'grocery', 'trip']).optional()
});

const listQuerySchema = z.object({
  includeTasks: z
    .string()
    .transform((value) => value === 'true')
    .optional()
});

router.use(requireAuth);

router.get('/', validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const includeTasks = req.query.includeTasks ?? false;

    const includes = [
      {
        model: User,
        as: 'members',
        where: { id_user: req.user.id_user },
        attributes: [],
        through: { attributes: [] }
      }
    ];

    if (includeTasks) {
      includes.push({
        model: Task,
        as: 'tasks',
        required: false,
        separate: true,
        order: [['position', 'ASC']]
      });
    }

    const lists = await List.findAll({
      include: includes,
      order: [['created_at', 'ASC']]
    });

    res.json(
      lists.map((list) => {
        const taskList = includeTasks && Array.isArray(list.tasks) ? list.tasks : undefined;
        return {
          id: list.id_list,
          name: list.name,
          type: list.type,
          ownerId: list.owner_id,
          createdAt: list.created_at,
          tasks: taskList
            ? taskList.map((task) => ({
                id: task.id_task,
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueAt: task.due_at
              }))
            : undefined
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(listCreateSchema), async (req, res, next) => {
  try {
    const { name, type } = req.body;

    const list = await List.create({
      name,
      type,
      owner_id: req.user.id_user
    });

    await ListMember.create({
      list_id: list.id_list,
      user_id: req.user.id_user,
      role: 'owner'
    });

    res.status(201).json({
      id: list.id_list,
      name: list.name,
      type: list.type,
      ownerId: list.owner_id
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:listId', validateBody(listUpdateSchema), async (req, res, next) => {
  try {
    const listId = Number.parseInt(req.params.listId, 10);
    if (Number.isNaN(listId)) {
      res.status(400).json({ error: 'Invalid list id' });
      return;
    }

    const list = await List.findByPk(listId);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (list.owner_id !== req.user.id_user) {
      res.status(403).json({ error: 'Only owner can update list' });
      return;
    }

    if (req.body.name !== undefined) {
      list.name = req.body.name;
    }
    if (req.body.type !== undefined) {
      list.type = req.body.type;
    }

    await list.save();

    res.json({
      id: list.id_list,
      name: list.name,
      type: list.type,
      ownerId: list.owner_id
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:listId', async (req, res, next) => {
  try {
    const listId = Number.parseInt(req.params.listId, 10);
    if (Number.isNaN(listId)) {
      res.status(400).json({ error: 'Invalid list id' });
      return;
    }

    const list = await List.findByPk(listId);
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    if (list.owner_id !== req.user.id_user) {
      res.status(403).json({ error: 'Only owner can delete list' });
      return;
    }

    await list.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
