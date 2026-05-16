import { PrismaClient, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.warn('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@achfinance.com' },
    update: {},
    create: {
      email: 'demo@achfinance.com',
      name: 'Demo User',
      passwordHash,
    },
  });

  const defaultCategories = [
    { name: 'Salary', color: '#22c55e', icon: 'briefcase', type: MovementType.INCOME },
    { name: 'Freelance', color: '#84cc16', icon: 'laptop', type: MovementType.INCOME },
    { name: 'Investments', color: '#06b6d4', icon: 'trending-up', type: MovementType.INCOME },
    { name: 'Housing', color: '#f97316', icon: 'home', type: MovementType.EXPENSE },
    { name: 'Food', color: '#ef4444', icon: 'utensils', type: MovementType.EXPENSE },
    { name: 'Transport', color: '#a855f7', icon: 'car', type: MovementType.EXPENSE },
    { name: 'Entertainment', color: '#ec4899', icon: 'film', type: MovementType.EXPENSE },
    { name: 'Health', color: '#14b8a6', icon: 'heart', type: MovementType.EXPENSE },
    { name: 'Education', color: '#3b82f6', icon: 'book', type: MovementType.EXPENSE },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: {},
      create: { ...cat, userId: user.id, isDefault: true },
    });
  }

  console.warn('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
