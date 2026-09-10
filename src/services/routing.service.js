const prisma = require('../config/database');

async function addSteps(documentId, steps) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { routingSteps: true },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.status === 'CANCELLED' || document.status === 'RESPONDED') {
    const error = new Error(`Cannot add routing steps to a document with status ${document.status}`);
    error.statusCode = 409;
    throw error;
  }

  const teamIds = steps.map((step) => step.teamId);
  const existingTeams = await prisma.team.findMany({
    where: { id: { in: teamIds } },
  });

  if (existingTeams.length !== teamIds.length) {
    const error = new Error('One or more team IDs are invalid');
    error.statusCode = 400;
    throw error;
  }

  const currentMaxOrder = document.routingSteps.reduce(
    (max, step) => Math.max(max, step.order),
    0
  );

  const now = new Date();
  const stepsToCreate = steps.map((step, index) => ({
    documentId,
    teamId: step.teamId,
    order: currentMaxOrder + index + 1,
    deadline: new Date(now.getTime() + step.days * 24 * 60 * 60 * 1000),
    status: 'PENDING',
  }));

  await prisma.routingStep.createMany({ data: stepsToCreate });

  if (document.status === 'RECEIVED') {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'IN_ROUTING' },
    });
  }

  return prisma.document.findUnique({
    where: { id: documentId },
    include: {
      routingSteps: {
        orderBy: { order: 'asc' },
        include: { team: true },
      },
    },
  });
}

module.exports = { addSteps };
