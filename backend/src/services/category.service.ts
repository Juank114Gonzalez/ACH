import { categoryRepository } from '../repositories/category.repository';
import { AppError } from '../utils/AppError';
import type { Category, MovementType } from '@prisma/client';

export const categoryService = {
  async getAll(userId: string, type?: MovementType): Promise<Category[]> {
    return categoryRepository.findAllByUser(userId, type);
  },

  async getById(id: string, userId: string): Promise<Category> {
    const cat = await categoryRepository.findById(id, userId);
    if (!cat) throw AppError.notFound('Category');
    return cat;
  },

  async create(
    userId: string,
    data: { name: string; color: string; icon: string; type: 'INCOME' | 'EXPENSE' },
  ): Promise<Category> {
    const existing = await categoryRepository.findByName(data.name, userId);
    if (existing) throw AppError.conflict('Category name already exists');
    return categoryRepository.create({ ...data, userId });
  },

  async update(
    id: string,
    userId: string,
    data: Partial<{ name: string; color: string; icon: string }>,
  ): Promise<Category> {
    const cat = await categoryRepository.findById(id, userId);
    if (!cat) throw AppError.notFound('Category');

    if (data.name && data.name !== cat.name) {
      const existing = await categoryRepository.findByName(data.name, userId);
      if (existing) throw AppError.conflict('Category name already exists');
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const cat = await categoryRepository.findById(id, userId);
    if (!cat) throw AppError.notFound('Category');
    if (cat.isDefault) throw AppError.forbidden('Cannot delete a default category');
    await categoryRepository.softDelete(id);
  },
};
