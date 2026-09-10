const prisma = require('../config/database');

async function list() {
  return prisma.documentType.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getById(id) {
  const documentType = await prisma.documentType.findUnique({ where: { id } });

  if (!documentType) {
    const error = new Error('Document type not found');
    error.statusCode = 404;
    throw error;
  }

  return documentType;
}

async function create(data) {
  return prisma.documentType.create({ data });
}

async function update(id, data) {
  await getById(id);

  return prisma.documentType.update({
    where: { id },
    data,
  });
}

async function remove(id) {
  await getById(id);

  return prisma.documentType.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
