const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const Tag = require('../models/Tag');
const Task = require('../models/Task');
const { TaskTag, ListMember } = require('../models/associations');

const router = express.Router();

const tagCreateSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().max(20).optional()
});

const tagAssignSchema = z.object({
  taskId: z.number().int().positive(),
  tagId: z.number().int().positive()
});

router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });
    res.json(
      tags.map((tag) => ({
        id: tag.id_tag,
        name: tag.name,
        color: tag.color
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(tagCreateSchema), async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.create({
      name,
      color: color ?? null
    });
    res.status(201).json({
      id: tag.id_tag,
      name: tag.name,
      color: tag.color
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Tag name already exists' });
      return;
    }
    next(error);
  }
});

router.post('/assign', validateBody(tagAssignSchema), async (req, res, next) => {
  try {
    const { taskId, tagId } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const isMember = await ListMember.findOne({
      where: { list_id: task.list_id, user_id: req.user.id_user }
    });
    if (!isMember) {
      res.status(403).json({ error: 'Access denied to list' });
      return;
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    await TaskTag.findOrCreate({
      where: { task_id: taskId, tag_id: tagId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/unassign', validateBody(tagAssignSchema), async (req, res, next) => {
  try {
    const { taskId, tagId } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const isMember = await ListMember.findOne({
      where: { list_id: task.list_id, user_id: req.user.id_user }
    });
    if (!isMember) {
      res.status(403).json({ error: 'Access denied to list' });
      return;
    }

    await TaskTag.destroy({
      where: { task_id: taskId, tag_id: tagId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
