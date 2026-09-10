const prisma = require('../config/database');

async function create(documentId, userId, content) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.uploadedById !== userId) {
    const error = new Error('Only the user who uploaded this document can respond to it');
    error.statusCode = 403;
    throw error;
  }

  if (document.status !== 'PENDING_RESPONSE') {
    const error = new Error(
      `Cannot respond to a document with status ${document.status}. All routing steps must be completed first.`
    );
    error.statusCode = 409;
    throw error;
  }

  const response = await prisma.response.create({
    data: {
      documentId,
      content,
      respondedById: userId,
    },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'RESPONDED' },
  });

  return response;
}

module.exports = { create };
