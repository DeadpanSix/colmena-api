require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../../src/config/database');

const SALT_ROUNDS = 12;

async function main() {
  const adminPasswordHash = await bcrypt.hash('Test1234!', SALT_ROUNDS);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@colmena.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@colmena.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('Seed user created:', adminUser.email);

  const teamMemberPasswordHash = await bcrypt.hash('Test1234!', SALT_ROUNDS);

  const teamMemberUser = await prisma.user.upsert({
    where: { email: 'developer@colmena.local' },
    update: {},
    create: {
      name: 'Developer Team Member',
      email: 'developer@colmena.local',
      passwordHash: teamMemberPasswordHash,
      role: 'DEPARTMENT',
      teamId: 3,
    },
  });

  console.log('Seed user created:', teamMemberUser.email);

  const secondTeamMemberPasswordHash = await bcrypt.hash('Test1234!', SALT_ROUNDS);

  const secondTeamMemberUser = await prisma.user.upsert({
    where: { email: 'mercadotecnia@colmena.local' },
    update: {},
    create: {
      name: 'Mercadotecnia Team Member 2',
      email: 'mercadotecnia@colmena.local',
      passwordHash: secondTeamMemberPasswordHash,
      role: 'DEPARTMENT',
      teamId: 4,
    },
  });

  console.log('Seed user created:', secondTeamMemberUser.email);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
