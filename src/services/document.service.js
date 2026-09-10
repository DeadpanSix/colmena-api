const prisma = require('../config/database');

async function generateFolio(documentTypeId) {
  const documentType = await prisma.documentType.findUnique({
    where: { id: documentTypeId },
  });

  if (!documentType) {
    const error = new Error('Document type not found');
    error.statusCode = 404;
    throw error;
  }

  const currentYear = new Date().getFullYear();
  const nextNumber = await getNextSequenceNumber();
  const paddedNumber = String(nextNumber).padStart(5, '0');

  return `${documentType.prefix}-${currentYear}-${paddedNumber}`;
}

async function getNextSequenceNumber() {
  await prisma.documentSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, current: 0 },
  });

  const updated = await prisma.documentSequence.update({
    where: { id: 1 },
    data: { current: { increment: 1 } },
  });

  return updated.current;
}

async function create({ title, documentTypeId, originDepartmentId, uploadedById, filePath }) {
  const originDepartment = await prisma.department.findUnique({
    where: { id: originDepartmentId },
  });

  if (!originDepartment) {
    const error = new Error('Origin department not found');
    error.statusCode = 404;
    throw error;
  }

  const folio = await generateFolio(documentTypeId);

  return prisma.document.create({
    data: {
      folio,
      title,
      filePath,
      documentTypeId,
      originDepartmentId,
      uploadedById,
      status: 'RECEIVED',
    },
    include: {
      documentType: true,
      originDepartment: true,
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

async function getById(id) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      documentType: true,
      originDepartment: true,
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
      routingSteps: {
        orderBy: { order: 'asc' },
        include: {
          team: true,
          completedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      response: true,
    },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  return document;
}

async function list() {
  return prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      documentType: true,
      originDepartment: true,
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

module.exports = { create, getById, list, generateFolio };
