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

async function completeStep(documentId, stepOrder, userId, userTeamId, comment) {
  const routingStep = await prisma.routingStep.findUnique({
    where: {
      documentId_order: {
        documentId,
        order: stepOrder,
      },
    },
  });

  if (!routingStep) {
    const error = new Error('Routing step not found');
    error.statusCode = 404;
    throw error;
  }

  if (routingStep.teamId !== userTeamId) {
    const error = new Error('This routing step does not belong to your team');
    error.statusCode = 403;
    throw error;
  }

  if (routingStep.status === 'COMPLETED') {
    const error = new Error('This routing step has already been completed');
    error.statusCode = 409;
    throw error;
  }

  const previousPendingStep = await prisma.routingStep.findFirst({
    where: {
      documentId,
      order: { lt: stepOrder },
      status: 'PENDING',
    },
  });

  if (previousPendingStep) {
    const error = new Error('A previous routing step must be completed first');
    error.statusCode = 409;
    throw error;
  }

  const updatedStep = await prisma.routingStep.update({
    where: { id: routingStep.id },
    data: {
      status: 'COMPLETED',
      comment,
      completedAt: new Date(),
      completedById: userId,
    },
    include: { team: true, completedBy: { select: { id: true, name: true, email: true } } },
  });

  const remainingSteps = await prisma.routingStep.count({
    where: { documentId, status: 'PENDING' },
  });

  if (remainingSteps === 0) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PENDING_RESPONSE' },
    });
  }

  return updatedStep;
}

module.exports = { addSteps, completeStep };
