import { transactionRepository, type TransactionFilters } from '../repositories/transaction.repository';
import { categoryRepository } from '../repositories/category.repository';
import { budgetRepository } from '../repositories/budget.repository';
import { AppError } from '../utils/AppError';
import type { PaginatedResult } from '../types/common.types';

export const transactionService = {
  async getMany(userId: string, filters: TransactionFilters): Promise<PaginatedResult<unknown>> {
    return transactionRepository.findMany(userId, filters);
  },

  async getById(id: string, userId: string): Promise<unknown> {
    const tx = await transactionRepository.findById(id, userId);
    if (!tx) throw AppError.notFound('Transaction');
    return tx;
  },

  async create(
    userId: string,
    data: {
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      description: string;
      categoryId: string;
      date: string;
      notes?: string;
    },
  ): Promise<unknown> {
    const category = await categoryRepository.findById(data.categoryId, userId);
    if (!category) throw AppError.notFound('Category');
    if (category.type !== data.type) {
      throw AppError.badRequest(`Category type (${category.type}) does not match transaction type (${data.type})`);
    }

    const tx = await transactionRepository.create({
      ...data,
      amount: data.amount,
      date: new Date(data.date),
      userId,
    });

    if (data.type === 'EXPENSE') {
      const d = new Date(data.date);
      await budgetRepository.updateSpent(userId, data.categoryId, d.getMonth() + 1, d.getFullYear());
    }

    return tx;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{
      type: 'INCOME' | 'EXPENSE';
      amount: number;
      description: string;
      categoryId: string;
      date: string;
      notes?: string;
    }>,
  ): Promise<unknown> {
    const existing = await transactionRepository.findById(id, userId);
    if (!existing) throw AppError.notFound('Transaction');

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId, userId);
      if (!category) throw AppError.notFound('Category');
      const txType = data.type ?? existing.type;
      if (category.type !== txType) {
        throw AppError.badRequest(`Category type (${category.type}) does not match transaction type (${txType})`);
      }
    }

    const tx = await transactionRepository.update(id, userId, {
      ...data,
      ...(data.amount && { amount: data.amount }),
      ...(data.date && { date: new Date(data.date) }),
    });

    // Recalculate budget for the OLD period/category (in case category or date changed)
    if (existing.type === 'EXPENSE') {
      const oldDate = new Date(existing.date);
      await budgetRepository.updateSpent(
        userId,
        existing.categoryId,
        oldDate.getMonth() + 1,
        oldDate.getFullYear(),
      );
    }

    // Recalculate budget for the NEW period/category
    if (tx.type === 'EXPENSE') {
      const newDate = new Date(tx.date);
      await budgetRepository.updateSpent(
        userId,
        tx.categoryId,
        newDate.getMonth() + 1,
        newDate.getFullYear(),
      );
    }

    return tx;
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await transactionRepository.findById(id, userId);
    if (!existing) throw AppError.notFound('Transaction');
    await transactionRepository.softDelete(id);

    if (existing.type === 'EXPENSE') {
      const d = new Date(existing.date);
      await budgetRepository.updateSpent(userId, existing.categoryId, d.getMonth() + 1, d.getFullYear());
    }
  },

  async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ totalIncome: number; totalExpenses: number; balance: number }> {
    return transactionRepository.getBalanceSummary(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  },
};
