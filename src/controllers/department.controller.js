const { z } = require('zod');
const departmentService = require('../services/department.service');

const createSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.string().max(100).optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.string().max(100).optional(),
});

async function list(req, res) {
  const departments = await departmentService.list();
  return res.status(200).json(departments);
}

async function getById(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid department id' });
  }

  try {
    const department = await departmentService.getById(id);
    return res.status(200).json(department);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function create(req, res) {
  const parseResult = createSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const department = await departmentService.create(parseResult.data);
    return res.status(201).json(department);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A department with this name already exists' });
    }
    console.error('Unexpected error creating department:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid department id' });
  }

  const parseResult = updateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const department = await departmentService.update(id, parseResult.data);
    return res.status(200).json(department);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A department with this name already exists' });
    }
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid department id' });
  }

  try {
    await departmentService.remove(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
