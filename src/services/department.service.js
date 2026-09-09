const prisma = require('../config/database');

async function list() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getById(id) {
  const department = await prisma.department.findUnique({ where: { id } });

  if (!department) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }

  return department;
}

async function create(data) {
  return prisma.department.create({ data });
}

async function update(id, data) {
  await getById(id); // throws 404 if it doesn't exist

  return prisma.department.update({
    where: { id },
    data,
  });
}

async function remove(id) {
  await getById(id);

  return prisma.department.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
