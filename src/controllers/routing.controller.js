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

const completeStepSchema = z.object({
  comment: z.string().min(1).max(2000),
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

async function completeStep(req, res) {
  const documentId = Number(req.params.id);
  const stepOrder = Number(req.params.order);

  if (Number.isNaN(documentId) || Number.isNaN(stepOrder)) {
    return res.status(400).json({ error: 'Invalid document id or step order' });
  }

  if (!req.user.teamId) {
    return res.status(403).json({ error: 'You must belong to a team to complete routing steps' });
  }

  const parseResult = completeStepSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const step = await routingService.completeStep(
      documentId,
      stepOrder,
      req.user.userId,
      req.user.teamId,
      parseResult.data.comment
    );
    return res.status(200).json(step);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Unexpected error completing routing step:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addSteps, completeStep };
