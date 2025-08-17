import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

async function main() {
  const email = 'demo@example.com';
  const plain = 'password123';
  const passwordHash = await bcrypt.hash(plain, SALT_ROUNDS);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash },
    create: { email, password: passwordHash },
  });

  // Ensure a workspace exists (adjust unique where to your schema)
  const workspace = await prisma.workspace.upsert({
    where: { name: 'Demo Workspace' }, // requires unique constraint on name
    update: {},
    create: {
      name: 'Demo Workspace',
      records: {
        createMany: {
          skipDuplicates: true,
          data: [
            { title: 'First Record', content: 'Hello world' },
            { title: 'Second Record', content: 'Another entry' },
          ],
        },
      },
    },
  });

  // Ensure membership exists (adjust unique where to your schema)
  // If you have a unique on (userId, workspaceId), you can use upsert.
  await prisma.membership.upsert({
    where: {
      // e.g., composite unique: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } }
      userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
    },
    update: { role: Role.OWNER },
    create: {
      role: Role.OWNER,
      userId: user.id,
      workspaceId: workspace.id,
    },
  });

  console.log('Seed complete. Demo user credentials:');
  console.log('Email:', email);
  console.log('Password:', plain);
  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
