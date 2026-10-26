import { PrismaClient } from '@prisma/client';

const passwords = ['postgres', 'admin', 'root', '1234', '12345', '123456', 'asus', 'password', ''];
const users = ['postgres', 'asus'];

async function testCredentials() {
  for (const user of users) {
    for (const pass of passwords) {
      const url = `postgresql://${user}:${pass}@localhost:5432/postgres?schema=public`;
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      try {
        await prisma.$connect();
        console.log(`FOUND VALID CREDENTIALS: user=${user}, pass=${pass}`);
        await prisma.$disconnect();
        return;
      } catch (err: any) {
        await prisma.$disconnect();
      }
    }
  }
  console.log('No default credentials matched.');
}

testCredentials();
