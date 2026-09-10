const { z } = require('zod');
const documentService = require('../services/document.service');

const createSchema = z.object({
  title: z.string().min(3).max(255),
  documentTypeId: z.coerce.number().int().positive(),
  originDepartmentId: z.coerce.number().int().positive(),
});

async function create(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'A file is required' });
  }

  const parseResult = createSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  const { title, documentTypeId, originDepartmentId } = parseResult.data;

  try {
    const document = await documentService.create({
      title,
      documentTypeId,
      originDepartmentId,
      uploadedById: req.user.userId,
      filePath: req.file.path,
    });

    return res.status(201).json(document);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Unexpected error creating document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getById(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  try {
    const document = await documentService.getById(id);
    return res.status(200).json(document);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

async function list(req, res) {
  const documents = await documentService.list();
  return res.status(200).json(documents);
}

module.exports = { create, getById, list };
