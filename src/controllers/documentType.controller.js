const { z } = require('zod');
const documentTypeService = require('../services/documentType.service');

const createSchema = z.object({
  name: z.string().min(2).max(100),
  prefix: z.string().min(2).max(20).regex(/^[A-Z0-9_-]+$/, 'Prefix must be uppercase letters, numbers, hyphens, or underscores only'),
});

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  prefix: z.string().min(2).max(20).regex(/^[A-Z0-9_-]+$/, 'Prefix must be uppercase letters, numbers, hyphens, or underscores only').optional(),
});

async function list(req, res) {
  const documentTypes = await documentTypeService.list();
  return res.status(200).json(documentTypes);
}

async function getById(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid document type id' });
  }

  try {
    const documentType = await documentTypeService.getById(id);
    return res.status(200).json(documentType);
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
    const documentType = await documentTypeService.create(parseResult.data);
    return res.status(201).json(documentType);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A document type with this name or prefix already exists' });
    }
    console.error('Unexpected error creating document type:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid document type id' });
  }

  const parseResult = updateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const documentType = await documentTypeService.update(id, parseResult.data);
    return res.status(200).json(documentType);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A document type with this name or prefix already exists' });
    }
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid document type id' });
  }

  try {
    await documentTypeService.remove(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

module.exports = { list, getById, create, update, remove };
