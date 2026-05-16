import { prisma } from '../config/database';
import type { RefreshToken } from '@prisma/client';

export const tokenRepository = {
  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  async findValid(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { token, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  async revoke(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};
