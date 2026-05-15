const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`User: ${user.email}, Role: ${user.role}`);
    console.log(`  Admin@123:`, await bcrypt.compare('Admin@123', user.password));
    console.log(`  Member@123:`, await bcrypt.compare('Member@123', user.password));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
