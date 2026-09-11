const { z } = require('zod');
const teamService = require('../services/team.service');

const createSchema = z.object({
  name: z.string().min(2).max(100),
});

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

async function list(req, res) {
  const teams = await teamService.list();
  return res.status(200).json(teams);
}

async function getById(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid team id' });
  }

  try {
    const team = await teamService.getById(id);
    return res.status(200).json(team);
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
    const team = await teamService.create(parseResult.data);
    return res.status(201).json(team);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A team with this name already exists' });
    }
    console.error('Unexpected error creating team:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid team id' });
  }

  const parseResult = updateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const team = await teamService.update(id, parseResult.data);
    return res.status(200).json(team);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A team with this name already exists' });
    }
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid team id' });
  }

  try {
    await teamService.remove(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
