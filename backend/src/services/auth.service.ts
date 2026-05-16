import type { Request } from 'express';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import type { RegisterDto, LoginDto, TokenPair } from '../types/auth.types';

function parseRefreshExpiry(): Date {
  const unit = env.JWT_REFRESH_EXPIRES_IN.slice(-1);
  const value = parseInt(env.JWT_REFRESH_EXPIRES_IN);
  const ms: Record<string, number> = { d: 86400000, h: 3600000, m: 60000 };
  return new Date(Date.now() + value * (ms[unit] ?? 86400000));
}

export const authService = {
  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; name: string }; tokens: TokenPair }> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) throw AppError.conflict('Email already registered');

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({ email: dto.email, name: dto.name, passwordHash });

    const tokens = await authService._issueTokens(user.id, user.email, user.name);
    return { user: { id: user.id, email: user.email, name: user.name }, tokens };
  },

  async login(
    dto: LoginDto,
    req: Request,
  ): Promise<{ user: { id: string; email: string; name: string }; tokens: TokenPair }> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) throw AppError.unauthorized('Invalid credentials');

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid credentials');

    const tokens = await authService._issueTokens(
      user.id,
      user.email,
      user.name,
      req.headers['user-agent'],
      req.ip,
    );
    return { user: { id: user.id, email: user.email, name: user.name }, tokens };
  },

  async refresh(
    rawToken: string,
    req: Request,
  ): Promise<TokenPair> {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const stored = await tokenRepository.findValid(rawToken);
    if (!stored) throw AppError.unauthorized('Refresh token revoked or expired');

    await tokenRepository.revoke(rawToken);

    const user = await userRepository.findById(payload.sub);
    if (!user) throw AppError.unauthorized('User not found');

    return authService._issueTokens(
      user.id,
      user.email,
      user.name,
      req.headers['user-agent'],
      req.ip,
    );
  },

  async logout(refreshToken: string): Promise<void> {
    await tokenRepository.revoke(refreshToken);
  },

  async logoutAll(userId: string): Promise<void> {
    await tokenRepository.revokeAllForUser(userId);
  },

  async _issueTokens(
    userId: string,
    email: string,
    name: string,
    userAgent?: string,
    ip?: string,
  ): Promise<TokenPair> {
    const accessToken = signAccessToken({ sub: userId, email, name });
    const refreshToken = signRefreshToken({ sub: userId });

    await tokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt: parseRefreshExpiry(),
      userAgent,
      ipAddress: ip,
    });

    return { accessToken, refreshToken };
  },
};
