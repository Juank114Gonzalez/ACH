import { prisma } from '../config/database';
import type { Budget, Prisma } from '@prisma/client';

export type BudgetWithCategory = Budget & {
  category: { id: string; name: string; color: string; icon: string };
};

export const budgetRepository = {
  async findMany(userId: string, month?: number, year?: number): Promise<BudgetWithCategory[]> {
    return prisma.budget.findMany({
      where: { userId, ...(month && { month }), ...(year && { year }) },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy: { category: { name: 'asc' } },
    }) as Promise<BudgetWithCategory[]>;
  },

  async findById(id: string, userId: string): Promise<BudgetWithCategory | null> {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    }) as Promise<BudgetWithCategory | null>;
  },

  async findByPeriod(
    userId: string,
    categoryId: string,
    month: number,
    year: number,
  ): Promise<Budget | null> {
    return prisma.budget.findFirst({ where: { userId, categoryId, month, year } });
  },

  async create(data: Prisma.BudgetUncheckedCreateInput): Promise<BudgetWithCategory> {
    return prisma.budget.create({
      data,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    }) as Promise<BudgetWithCategory>;
  },

  async update(id: string, data: Prisma.BudgetUpdateInput): Promise<BudgetWithCategory> {
    return prisma.budget.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    }) as Promise<BudgetWithCategory>;
  },

  async updateSpent(userId: string, categoryId: string, month: number, year: number): Promise<void> {
    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: 'EXPENSE',
        deletedAt: null,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: { amount: true },
    });

    await prisma.budget.updateMany({
      where: { userId, categoryId, month, year },
      data: { spent: result._sum.amount ?? 0 },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({ where: { id } });
  },
};
