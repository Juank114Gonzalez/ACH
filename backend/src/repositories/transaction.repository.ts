import { prisma } from '../config/database';
import type { Transaction, MovementType, Prisma } from '@prisma/client';
import type { PaginatedResult } from '../types/common.types';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: MovementType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

const transactionWithCategory = {
  include: { category: { select: { id: true, name: true, color: true, icon: true } } },
};

export const transactionRepository = {
  async findMany(
    userId: string,
    filters: TransactionFilters,
  ): Promise<PaginatedResult<Transaction & { category: { id: string; name: string; color: string; icon: string } }>> {
    const { skip, take, page, limit } = parsePagination(filters);

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search && {
        description: { contains: filters.search, mode: 'insensitive' },
      }),
      ...(filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && { gte: new Date(filters.startDate) }),
              ...(filters.endDate && { lte: new Date(filters.endDate) }),
            },
          }
        : {}),
    };

    const orderBy: Prisma.TransactionOrderByWithRelationInput = {
      [filters.sortBy ?? 'date']: filters.sortOrder ?? 'desc',
    };

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({ where, skip, take, orderBy, ...transactionWithCategory }),
      prisma.transaction.count({ where }),
    ]);

    return buildPaginatedResult(data as (Transaction & { category: { id: string; name: string; color: string; icon: string } })[], total, page, limit);
  },

  async findById(id: string, userId: string): Promise<(Transaction & { category: { id: string; name: string; color: string; icon: string } }) | null> {
    return prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      ...transactionWithCategory,
    }) as Promise<(Transaction & { category: { id: string; name: string; color: string; icon: string } }) | null>;
  },

  async create(
    data: Prisma.TransactionUncheckedCreateInput,
  ): Promise<Transaction & { category: { id: string; name: string; color: string; icon: string } }> {
    return prisma.transaction.create({ data, ...transactionWithCategory }) as Promise<Transaction & { category: { id: string; name: string; color: string; icon: string } }>;
  },

  async update(
    id: string,
    _userId: string,
    data: Prisma.TransactionUpdateInput,
  ): Promise<Transaction & { category: { id: string; name: string; color: string; icon: string } }> {
    return prisma.transaction.update({
      where: { id },
      data,
      ...transactionWithCategory,
    }) as Promise<Transaction & { category: { id: string; name: string; color: string; icon: string } }>;
  },

  async softDelete(id: string): Promise<void> {
    await prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async getBalanceSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ totalIncome: number; totalExpenses: number; balance: number }> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(startDate || endDate
        ? { date: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } }
        : {}),
    };

    const result = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: { amount: true },
    });

    const incomeEntry = result.find((r) => r.type === 'INCOME');
    const expenseEntry = result.find((r) => r.type === 'EXPENSE');
    const totalIncome = Number(incomeEntry?._sum.amount ?? 0);
    const totalExpenses = Number(expenseEntry?._sum.amount ?? 0);

    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  },
};
