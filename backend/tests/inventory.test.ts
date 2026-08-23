import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../src/middleware/errorHandler';
import { prisma } from '../src/utils/prisma';

jest.mock('../src/utils/prisma', () => ({
  prisma: {
    vehicle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prismaVehicle = prisma.vehicle as unknown as {
  findUnique: jest.Mock;
  update: jest.Mock;
};

const jwtMock = jwt as jest.Mocked<typeof jwt>;

const buildApp = () => {
  const { vehicleRouter } = require('../src/routes/vehicleRoutes') as typeof import('../src/routes/vehicleRoutes');
  const app = express();
  app.use(express.json());
  app.use('/api/vehicles', vehicleRouter);
  app.use(errorHandler);
  return app;
};

describe('inventory endpoints', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows an authenticated user to purchase a vehicle and decrements quantity', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      email: 'buyer@dealer.com',
      role: 'USER',
    } as never);
    prismaVehicle.findUnique.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999.00' },
      quantity: 2,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    prismaVehicle.update.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999.00' },
      quantity: 1,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vehicle purchased successfully');
    expect(prismaVehicle.update).toHaveBeenCalledWith({
      where: { id: 'vehicle-1' },
      data: { quantity: 1 },
    });
  });

  it('rejects purchases when quantity is zero', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      email: 'buyer@dealer.com',
      role: 'USER',
    } as never);
    prismaVehicle.findUnique.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999.00' },
      quantity: 0,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Vehicle is out of stock');
  });

  it('allows admins to restock a vehicle by quantity', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'admin-1',
      email: 'admin@dealer.com',
      role: 'ADMIN',
    } as never);
    prismaVehicle.findUnique.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999.00' },
      quantity: 2,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    prismaVehicle.update.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999.00' },
      quantity: 7,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/restock')
      .set('Authorization', 'Bearer admin-token')
      .send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vehicle restocked successfully');
    expect(prismaVehicle.update).toHaveBeenCalledWith({
      where: { id: 'vehicle-1' },
      data: { quantity: 7 },
    });
  });
});

