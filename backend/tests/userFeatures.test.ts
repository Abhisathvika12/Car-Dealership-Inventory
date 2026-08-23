import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../src/middleware/errorHandler';

jest.mock('../src/utils/prisma', () => ({
  prisma: {
    favorite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    recentlyViewed: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const jwtMock = jwt as jest.Mocked<typeof jwt>;

const buildApp = () => {
  const { vehicleRouter } = require('../src/routes/vehicleRoutes') as typeof import('../src/routes/vehicleRoutes');
  const app = express();
  app.use(express.json());
  app.use('/api/vehicles', vehicleRouter);
  app.use(errorHandler);
  return app;
};

describe('user features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('toggles favorite', async () => {
    jwtMock.verify.mockReturnValue({ sub: 'user-1', email: 'u@x.com', role: 'USER' } as never);

    const { prisma } = require('../src/utils/prisma');
    prisma.favorite.findUnique.mockResolvedValue(null);
    prisma.favorite.create.mockResolvedValue({ id: 'fav-1' });

    const app = buildApp();

    const res = await request(app).post('/api/vehicles/vehicle-1/favorite').set('Authorization', 'Bearer user-token');

    expect(res.status).toBe(200);
    expect(res.body.favorited).toBe(true);
  });

  it('lists recently viewed', async () => {
    jwtMock.verify.mockReturnValue({ sub: 'user-1', email: 'u@x.com', role: 'USER' } as never);

    const { prisma } = require('../src/utils/prisma');
    prisma.recentlyViewed.findMany.mockResolvedValue([
      { vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: { toString: () => '27999' }, quantity: 1 } },
    ]);

    const app = buildApp();

    const res = await request(app).get('/api/vehicles/recent').set('Authorization', 'Bearer user-token');

    expect(res.status).toBe(200);
    expect(res.body.recentlyViewed).toHaveLength(1);
  });
});
