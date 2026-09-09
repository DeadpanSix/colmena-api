require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../../src/config/database');

const SALT_ROUNDS = 12;

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', SALT_ROUNDS);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@colmena.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@colmena.local',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Seed user created:', adminUser.email);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
