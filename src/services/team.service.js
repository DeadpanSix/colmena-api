const prisma = require('../config/database');

async function list() {
  return prisma.team.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getById(id) {
  const team = await prisma.team.findUnique({ where: { id } });

  if (!team) {
    const error = new Error('Team not found');
    error.statusCode = 404;
    throw error;
  }

  return team;
}

async function create(data) {
  return prisma.team.create({ data });
}

async function update(id, data) {
  await getById(id);

  return prisma.team.update({
    where: { id },
    data,
  });
}

async function remove(id) {
  await getById(id);

  return prisma.team.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
