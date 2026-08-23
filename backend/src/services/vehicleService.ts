import { Prisma, type Vehicle } from '@prisma/client';

import { prisma } from '../utils/prisma';
import { badRequest, conflict, notFound } from '../middleware/httpError';

export type VehicleInput = {
  make: string;
  model: string;
  category: string;
  price: string | number;
  quantity: number;
};

export type VehicleUpdateInput = Partial<VehicleInput>;
export type VehicleSearchInput = {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type RestockInput = {
  quantity: number;
};

const normalizeText = (value: string) => value.trim();

const normalizePrice = (value: string | number) => {
  const price = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(price) || price < 0) {
    throw badRequest('Price must be a valid non-negative number');
  }

  return price;
};

const normalizeQuantity = (value: number) => {
  if (!Number.isInteger(value) || value < 0) {
    throw badRequest('Quantity must be a non-negative integer');
  }

  return value;
};

const toDecimal = (value: string | number): Prisma.Decimal =>
  new Prisma.Decimal(normalizePrice(value));

export const vehicleService = {
  async create(input: VehicleInput): Promise<Vehicle> {
    return prisma.vehicle.create({
      data: {
        make: normalizeText(input.make),
        model: normalizeText(input.model),
        category: normalizeText(input.category),
        price: toDecimal(input.price),
        quantity: normalizeQuantity(input.quantity),
      },
    });
  },

  async listAvailable(): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: {
        quantity: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async search(input: VehicleSearchInput): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {
      quantity: {
        gt: 0,
      },
    };

    if (input.make) {
      where.make = {
        contains: normalizeText(input.make),
      };
    }

    if (input.model) {
      where.model = {
        contains: normalizeText(input.model),
      };
    }

    if (input.category) {
      where.category = {
        contains: normalizeText(input.category),
      };
    }

    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      where.price = {};

      if (input.minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(normalizePrice(input.minPrice));
      }

      if (input.maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(normalizePrice(input.maxPrice));
      }
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  },

  async update(id: string, input: VehicleUpdateInput): Promise<Vehicle> {
    const data: Prisma.VehicleUpdateInput = {};

    if (input.make !== undefined) data.make = normalizeText(input.make);
    if (input.model !== undefined) data.model = normalizeText(input.model);
    if (input.category !== undefined)
      data.category = normalizeText(input.category);
    if (input.price !== undefined) data.price = toDecimal(input.price);
    if (input.quantity !== undefined)
      data.quantity = normalizeQuantity(input.quantity);

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    return prisma.vehicle.delete({
      where: { id },
    });
  },

  async purchase(id: string): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw notFound('Vehicle not found');
    }

    if (vehicle.quantity <= 0) {
      throw conflict('Vehicle is out of stock');
    }

    return prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity - 1,
      },
    });
  },

  async restock(id: string, input: RestockInput): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      throw notFound('Vehicle not found');
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw badRequest('Restock quantity must be a positive integer');
    }

    return prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity + input.quantity,
      },
    });
  },
};
