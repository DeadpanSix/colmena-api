const { z } = require('zod');
const routingService = require('../services/routing.service');

const addStepsSchema = z.object({
  steps: z.array(
    z.object({
      teamId: z.number().int().positive(),
      days: z.number().int().positive().max(90),
    })
  ).min(1),
});

async function addSteps(req, res) {
  const documentId = Number(req.params.id);

  if (Number.isNaN(documentId)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  const parseResult = addStepsSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const document = await routingService.addSteps(documentId, parseResult.data.steps);
    return res.status(201).json(document);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Unexpected error adding routing steps:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addSteps };
