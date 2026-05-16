import { prisma } from '../config/database';
import type { User } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  async create(data: { email: string; name: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
