import { prisma } from '../config/database';
import type { Category, MovementType, Prisma } from '@prisma/client';

export const categoryRepository = {
  async findAllByUser(userId: string, type?: MovementType): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId, deletedAt: null, ...(type && { type }) },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, userId, deletedAt: null } });
  },

  async findByName(name: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, userId, deletedAt: null },
    });
  },

  async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  },

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  },

  async softDelete(id: string): Promise<void> {
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
