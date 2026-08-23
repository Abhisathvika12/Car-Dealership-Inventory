import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../src/middleware/errorHandler';

import { prisma } from '../src/utils/prisma';

jest.mock('../src/utils/prisma', () => ({
  prisma: {
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const prismaVehicle = prisma.vehicle as unknown as {
  create: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const jwtMock = jwt as jest.Mocked<typeof jwt>;

const adminPayload = {
  sub: 'admin-1',
  email: 'admin@dealer.com',
  role: 'ADMIN' as const,
};

const userPayload = {
  sub: 'user-1',
  email: 'buyer@dealer.com',
  role: 'USER' as const,
};

describe('vehicle endpoints', () => {
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

  it('allows admins to create a vehicle', async () => {
    jwtMock.verify.mockReturnValue(adminPayload as never);
    prismaVehicle.create.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999' },
      quantity: 4,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', 'Bearer admin-token')
      .send({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 27999,
        quantity: 4,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Vehicle created successfully');
    expect(prismaVehicle.create).toHaveBeenCalled();
  });

  it('lists available vehicles for authenticated users', async () => {
    jwtMock.verify.mockReturnValue(userPayload as never);
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
      .get('/api/vehicles')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
  });

  it('allows authenticated users to update a vehicle', async () => {
    jwtMock.verify.mockReturnValue(userPayload as never);
    prismaVehicle.findUnique.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999' },
      quantity: 4,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    prismaVehicle.update.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '28999' },
      quantity: 3,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .put('/api/vehicles/vehicle-1')
      .set('Authorization', 'Bearer user-token')
      .send({
        price: 28999,
        quantity: 3,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vehicle updated successfully');
  });

  it('allows admins to delete a vehicle', async () => {
    jwtMock.verify.mockReturnValue(adminPayload as never);
    prismaVehicle.findUnique.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999' },
      quantity: 4,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });
    prismaVehicle.delete.mockResolvedValue({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'Sedan',
      price: { toString: () => '27999' },
      quantity: 4,
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    });

    const app = buildApp();

    const response = await request(app)
      .delete('/api/vehicles/vehicle-1')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vehicle deleted successfully');
  });
});

