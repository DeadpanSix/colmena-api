const { z } = require('zod');
const responseService = require('../services/response.service');

const createSchema = z.object({
  content: z.string().min(1).max(5000),
});

async function create(req, res) {
  const documentId = Number(req.params.id);

  if (Number.isNaN(documentId)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  const parseResult = createSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const response = await responseService.create(
      documentId,
      req.user.userId,
      parseResult.data.content
    );
    return res.status(201).json(response);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Unexpected error creating response:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { create };
