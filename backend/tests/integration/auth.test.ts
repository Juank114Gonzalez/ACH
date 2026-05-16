import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { userRepository } from '../../src/repositories/user.repository';
import { tokenRepository } from '../../src/repositories/token.repository';
import * as password from '../../src/utils/password';

vi.mock('../../src/repositories/user.repository');
vi.mock('../../src/repositories/token.repository');
vi.mock('../../src/utils/password');

const mockUser = {
  id: 'user-id-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2b$12$hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return 201 with access token on success', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(mockUser);
    vi.mocked(password.hashPassword).mockResolvedValue('hashed');
    vi.mocked(tokenRepository.create).mockResolvedValue({
      id: 'tkn-1',
      token: 'rt',
      userId: 'user-id-1',
      expiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
    });

    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      name: 'Test',
      password: 'Password123!',
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 for weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      name: 'Test',
      password: 'weak',
    });
    expect(res.status).toBe(400);
  });

  it('should return 409 if email already exists', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/v1/health', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
