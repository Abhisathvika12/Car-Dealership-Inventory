import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../src/middleware/errorHandler';
import { prisma } from '../src/utils/prisma';

jest.mock('../src/utils/prisma', () => ({
  prisma: {
    vehicle: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prismaVehicle = prisma.vehicle as unknown as {
  findMany: jest.Mock;
};

const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe('vehicle search endpoint', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildApp = () => {
    const { vehicleRouter } = require('../src/routes/vehicleRoutes') as typeof import('../src/routes/vehicleRoutes');
    const app = express();
    app.use(express.json());
    app.use('/api/vehicles', vehicleRouter);
    app.use(errorHandler);
    return app;
  };

  it('returns filtered available vehicles for search queries', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      email: 'buyer@dealer.com',
      role: 'USER',
    } as never);

    prismaVehicle.findMany.mockResolvedValue([
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: { toString: () => '27999' },
        quantity: 4,
        createdAt: new Date('2026-08-23T00:00:00.000Z'),
        updatedAt: new Date('2026-08-23T00:00:00.000Z'),
      },
    ]);

    const app = buildApp();

    const response = await request(app)
      .get('/api/vehicles/search')
      .set('Authorization', 'Bearer user-token')
      .query({
        make: 'Toy',
        category: 'Sedan',
        minPrice: '20000',
        maxPrice: '30000',
      });

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(prismaVehicle.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        quantity: { gt: 0 },
      }),
      orderBy: { createdAt: 'desc' },
    });
  });
});

