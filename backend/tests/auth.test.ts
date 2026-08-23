import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { createApp } from '../src/app';
import { prisma } from '../src/utils/prisma';

jest.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prismaUser = prisma.user as unknown as {
  findUnique: jest.Mock;
  create: jest.Mock;
};

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe('auth endpoints', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user, hashes the password, and returns a token', async () => {
    prismaUser.findUnique.mockResolvedValue(null);
    prismaUser.create.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@dealer.com',
      password: 'hashed-password',
      role: 'USER',
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    bcryptMock.hash.mockResolvedValue('hashed-password' as never);
    jwtMock.sign.mockReturnValue('jwt-token' as never);

    const app = createApp();

    const response = await request(app).post('/api/auth/register').send({
      email: 'buyer@dealer.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Account created successfully',
        token: 'jwt-token',
        role: 'USER',
      }),
    );
    expect(bcryptMock.hash).toHaveBeenCalledWith('StrongPass123', 10);
    expect(prismaUser.create).toHaveBeenCalledWith({
      data: {
        email: 'buyer@dealer.com',
        password: 'hashed-password',
      },
    });
  });

  it('rejects duplicate registrations', async () => {
    prismaUser.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@dealer.com',
      password: 'hashed-password',
      role: 'USER',
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = createApp();

    const response = await request(app).post('/api/auth/register').send({
      email: 'buyer@dealer.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('An account with this email already exists');
  });

  it('logs in a valid user and returns a token', async () => {
    prismaUser.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@dealer.com',
      password: 'hashed-password',
      role: 'ADMIN',
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    bcryptMock.compare.mockResolvedValue(true as never);
    jwtMock.sign.mockReturnValue('jwt-token' as never);

    const app = createApp();

    const response = await request(app).post('/api/auth/login').send({
      email: 'buyer@dealer.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Login successful',
        token: 'jwt-token',
        role: 'ADMIN',
      }),
    );
    expect(bcryptMock.compare).toHaveBeenCalledWith(
      'StrongPass123',
      'hashed-password',
    );
  });

  it('rejects invalid login credentials', async () => {
    prismaUser.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@dealer.com',
      password: 'hashed-password',
      role: 'ADMIN',
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    bcryptMock.compare.mockResolvedValue(false as never);

    const app = createApp();

    const response = await request(app).post('/api/auth/login').send({
      email: 'buyer@dealer.com',
      password: 'WrongPass123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });
});
