import { budgetRepository, type BudgetWithCategory } from '../repositories/budget.repository';
import { categoryRepository } from '../repositories/category.repository';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export interface BudgetAlert {
  budgetId: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
  level: 'warning' | 'exceeded';
}

export const budgetService = {
  async getAll(userId: string, month?: number, year?: number): Promise<BudgetWithCategory[]> {
    return budgetRepository.findMany(userId, month, year);
  },

  async getById(id: string, userId: string): Promise<BudgetWithCategory> {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw AppError.notFound('Budget');
    return budget;
  },

  async create(
    userId: string,
    data: { categoryId: string; amount: number; month: number; year: number },
  ): Promise<BudgetWithCategory> {
    const category = await categoryRepository.findById(data.categoryId, userId);
    if (!category) throw AppError.notFound('Category');
    if (category.type !== 'EXPENSE') {
      throw AppError.badRequest('Budgets can only be created for expense categories');
    }

    const existing = await budgetRepository.findByPeriod(
      userId,
      data.categoryId,
      data.month,
      data.year,
    );
    if (existing) throw AppError.conflict('Budget already exists for this category and period');

    const budget = await budgetRepository.create({ ...data, userId });
    await budgetRepository.updateSpent(userId, data.categoryId, data.month, data.year);

    return budgetRepository.findById(budget.id, userId) as Promise<BudgetWithCategory>;
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{ amount: number; month: number; year: number }>,
  ): Promise<BudgetWithCategory> {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw AppError.notFound('Budget');
    return budgetRepository.update(id, data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw AppError.notFound('Budget');
    await budgetRepository.delete(id);
  },

  async getAlerts(userId: string, month: number, year: number): Promise<BudgetAlert[]> {
    const budgets = await budgetRepository.findMany(userId, month, year);
    const alerts: BudgetAlert[] = [];

    for (const b of budgets) {
      const spent = Number(b.spent);
      const limit = Number(b.amount);
      if (limit === 0) continue;

      const percentage = (spent / limit) * 100;

      if (percentage >= 100) {
        alerts.push({
          budgetId: b.id,
          categoryName: b.category.name,
          spent,
          limit,
          percentage: Math.round(percentage),
          level: 'exceeded',
        });
        logger.warn(`Budget exceeded: ${b.category.name} (${Math.round(percentage)}%)`);
      } else if (percentage >= 80) {
        alerts.push({
          budgetId: b.id,
          categoryName: b.category.name,
          spent,
          limit,
          percentage: Math.round(percentage),
          level: 'warning',
        });
      }
    }

    return alerts;
  },
};
