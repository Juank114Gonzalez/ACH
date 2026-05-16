import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';
import { tokenRepository } from '../../src/repositories/token.repository';
import { AppError } from '../../src/utils/AppError';
import * as password from '../../src/utils/password';

vi.mock('../../src/repositories/user.repository');
vi.mock('../../src/repositories/token.repository');
vi.mock('../../src/utils/password');

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.mocked(password.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(tokenRepository.create).mockResolvedValue({
        id: 'token-1',
        token: 'refresh-token',
        userId: 'user-1',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
        userAgent: null,
        ipAddress: null,
      });

      const result = await authService.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw conflict error if email already exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('login', () => {
    it('should throw unauthorized if user not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      const mockReq = { headers: {}, ip: '127.0.0.1' } as never;

      await expect(
        authService.login({ email: 'notfound@example.com', password: 'pass' }, mockReq),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should throw unauthorized if password is incorrect', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(password.comparePassword).mockResolvedValue(false);
      const mockReq = { headers: {}, ip: '127.0.0.1' } as never;

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass!' }, mockReq),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should return tokens on successful login', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(password.comparePassword).mockResolvedValue(true);
      vi.mocked(tokenRepository.create).mockResolvedValue({
        id: 'token-1',
        token: 'refresh-token',
        userId: 'user-1',
        expiresAt: new Date(),
        createdAt: new Date(),
        revokedAt: null,
        userAgent: null,
        ipAddress: null,
      });
      const mockReq = { headers: {}, ip: '127.0.0.1' } as never;

      const result = await authService.login(
        { email: 'test@example.com', password: 'Password123!' },
        mockReq,
      );

      expect(result.tokens.accessToken).toBeDefined();
    });
  });
});
