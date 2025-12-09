const express = require('express');
const { z } = require('zod');
const { Op } = require('sequelize');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validate');
const Task = require('../models/Task');
const List = require('../models/List');
const { ListMember, TaskAssignee, TaskTag } = require('../models/associations');
const Tag = require('../models/Tag');
const User = require('../models/User');

const router = express.Router();

const taskCreateSchema = z.object({
  listId: z.number().int().positive(),
  title: z.string().min(1).max(150),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  position: z.number().int().nonnegative().nullable().optional(),
  assigneeIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional()
});

const taskUpdateSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  position: z.number().int().nonnegative().nullable().optional(),
  assigneeIds: z.array(z.number().int().positive()).optional(),
  tagIds: z.array(z.number().int().positive()).optional()
});

const taskQuerySchema = z.object({
  listId: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || /^\d+$/.test(value),
      'listId must be numeric'
    )
    .transform((val) => (val ? Number.parseInt(val, 10) : undefined)),
  status: z.enum(['todo', 'doing', 'done']).optional()
});

router.use(requireAuth);

async function ensureListAccess(userId, listId) {
  const membership = await ListMember.findOne({
    where: {
      user_id: userId,
      list_id: listId
    }
  });

  if (!membership) {
    return null;
  }

  return List.findByPk(listId);
}

async function syncAssignees(listId, taskId, assigneeIds) {
  await TaskAssignee.destroy({ where: { task_id: taskId } });
  if (assigneeIds.length > 0) {
    const uniqueIds = Array.from(new Set(assigneeIds));
    const memberships = await ListMember.findAll({
      where: {
        list_id: listId,
        user_id: {
          [Op.in]: uniqueIds
        }
      }
    });

    const allowedIds = new Set(
      memberships.map((membership) => membership.getDataValue('user_id'))
    );

    const missingAssignees = uniqueIds.filter((userId) => !allowedIds.has(userId));
    if (missingAssignees.length > 0) {
      throw new Error('INVALID_ASSIGNEE');
    }

    const entries = uniqueIds.map((userId) => ({
      task_id: taskId,
      user_id: userId
    }));

    await TaskAssignee.bulkCreate(entries);
  }
}

async function syncTags(taskId, tagIds) {
  await TaskTag.destroy({ where: { task_id: taskId } });
  if (tagIds.length > 0) {
    const uniqueIds = Array.from(new Set(tagIds));
    const tags = await Tag.findAll({
      where: {
        id_tag: {
          [Op.in]: uniqueIds
        }
      }
    });
    if (tags.length !== uniqueIds.length) {
      throw new Error('INVALID_TAG');
    }
    await TaskTag.bulkCreate(
      uniqueIds.map((tagId) => ({ task_id: taskId, tag_id: tagId }))
    );
  }
}

router.get('/', validateQuery(taskQuerySchema), async (req, res, next) => {
  try {
    const { listId, status } = req.query;

    const whereClause = {};
    if (listId) {
      const listAccess = await ensureListAccess(req.user.id_user, listId);
      if (!listAccess) {
        res.status(403).json({ error: 'Access denied to list' });
        return;
      }
      whereClause.list_id = listId;
    } else {
      const accessibleListIds = await ListMember.findAll({
        where: { user_id: req.user.id_user }
      });
      const listIds = accessibleListIds.map((lm) => lm.getDataValue('list_id'));
      if (listIds.length === 0) {
        res.json([]);
        return;
      }
      whereClause.list_id = {
        [Op.in]: listIds
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id_user', 'email', 'name'],
          through: { attributes: [] }
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ],
      order: [['position', 'ASC']]
    });

    res.json(
      tasks.map((task) => {
        const assignees = Array.isArray(task.assignees) ? task.assignees : [];
        const tags = Array.isArray(task.tags) ? task.tags : [];
        return {
          id: task.id_task,
          listId: task.list_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueAt: task.due_at,
          position: task.position,
          assignees: assignees.map((assignee) => ({
            id: assignee.id_user,
            email: assignee.email,
            name: assignee.name
          })),
          tags: tags.map((tag) => ({
            id: tag.id_tag,
            name: tag.name,
            color: tag.color
          }))
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(taskCreateSchema), async (req, res, next) => {
  try {
    const {
      listId,
      title,
      description,
      status,
      priority,
      dueAt,
      position,
      assigneeIds = [],
      tagIds = []
    } = req.body;

    const list = await ensureListAccess(req.user.id_user, listId);
    if (!list) {
      res.status(403).json({ error: 'Access denied to list' });
      return;
    }

    const task = await Task.create({
      list_id: listId,
      title,
      description: description ?? null,
      status: status ?? 'todo',
      priority: priority ?? 'med',
      due_at: dueAt ? new Date(dueAt) : null,
      position: position ?? null
    });

    if (assigneeIds.length > 0) {
      await syncAssignees(list.id_list, task.id_task, assigneeIds);
    }

    if (tagIds.length > 0) {
      await syncTags(task.id_task, tagIds);
    }

    const createdTask = await Task.findByPk(task.id_task, {
      include: [
        { model: User, as: 'assignees', attributes: ['id_user', 'email', 'name'] },
        { model: Tag, as: 'tags' }
      ]
    });

    const assignees = createdTask && Array.isArray(createdTask.assignees)
      ? createdTask.assignees
      : [];
    const tags = createdTask && Array.isArray(createdTask.tags) ? createdTask.tags : [];

    res.status(201).json({
      id: task.id_task,
      listId: task.list_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueAt: task.due_at,
      position: task.position,
      assignees: assignees.map((user) => ({
        id: user.id_user,
        email: user.email,
        name: user.name
      })),
      tags: tags.map((tag) => ({
        id: tag.id_tag,
        name: tag.name,
        color: tag.color
      }))
    });
  } catch (error) {
    if (error.message === 'INVALID_ASSIGNEE') {
      res.status(400).json({ error: 'One or more assignees are not list members' });
      return;
    }
    if (error.message === 'INVALID_TAG') {
      res.status(400).json({ error: 'One or more tags do not exist' });
      return;
    }
    next(error);
  }
});

router.patch('/:taskId', validateBody(taskUpdateSchema), async (req, res, next) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (Number.isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task id' });
      return;
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const list = await ensureListAccess(req.user.id_user, task.list_id);
    if (!list) {
      res.status(403).json({ error: 'Access denied to list' });
      return;
    }

    const payload = req.body;

    if (payload.title !== undefined) {
      task.title = payload.title;
    }
    if (payload.description !== undefined) {
      task.description = payload.description;
    }
    if (payload.status !== undefined) {
      task.status = payload.status;
    }
    if (payload.priority !== undefined) {
      task.priority = payload.priority;
    }
    if (payload.dueAt !== undefined) {
      task.due_at = payload.dueAt ? new Date(payload.dueAt) : null;
    }
    if (payload.position !== undefined) {
      task.position = payload.position ?? null;
    }

    await task.save();

    if (payload.assigneeIds) {
      await syncAssignees(list.id_list, task.id_task, payload.assigneeIds);
    }
    if (payload.tagIds) {
      await syncTags(task.id_task, payload.tagIds);
    }

    const updatedTask = await Task.findByPk(task.id_task, {
      include: [
        { model: User, as: 'assignees', attributes: ['id_user', 'email', 'name'] },
        { model: Tag, as: 'tags' }
      ]
    });

    const assignees = updatedTask && Array.isArray(updatedTask.assignees)
      ? updatedTask.assignees
      : [];
    const tags = updatedTask && Array.isArray(updatedTask.tags) ? updatedTask.tags : [];

    res.json({
      id: task.id_task,
      listId: task.list_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueAt: task.due_at,
      position: task.position,
      assignees: assignees.map((user) => ({
        id: user.id_user,
        email: user.email,
        name: user.name
      })),
      tags: tags.map((tag) => ({
        id: tag.id_tag,
        name: tag.name,
        color: tag.color
      }))
    });
  } catch (error) {
    if (error.message === 'INVALID_ASSIGNEE') {
      res.status(400).json({ error: 'One or more assignees are not list members' });
      return;
    }
    if (error.message === 'INVALID_TAG') {
      res.status(400).json({ error: 'One or more tags do not exist' });
      return;
    }
    next(error);
  }
});

router.delete('/:taskId', async (req, res, next) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (Number.isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task id' });
      return;
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const list = await ensureListAccess(req.user.id_user, task.list_id);
    if (!list) {
      res.status(403).json({ error: 'Access denied to list' });
      return;
    }

    await task.destroy();
    res.status(204).send();
  } catch (error) {
    if (error.message === 'INVALID_ASSIGNEE') {
      res.status(400).json({ error: 'One or more assignees are not list members' });
      return;
    }
    if (error.message === 'INVALID_TAG') {
      res.status(400).json({ error: 'One or more tags do not exist' });
      return;
    }
    next(error);
  }
});

module.exports = router;
