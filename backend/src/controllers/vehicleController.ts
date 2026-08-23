import type { Request, Response } from 'express';

import { vehicleService } from '../services/vehicleService';
import { badRequest, notFound } from '../middleware/httpError';

const getVehicleId = (id: string | string[]) => {
  if (Array.isArray(id)) {
    return id[0];
  }

  return id;
};

const parseQuantity = (value: unknown) => {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw badRequest('Quantity must be a non-negative integer');
  }

  return quantity;
};

const parsePrice = (value: unknown) => {
  const price = Number(value);

  if (Number.isNaN(price) || price < 0) {
    throw badRequest('Price must be a valid non-negative number');
  }

  return price;
};

const toVehicleResponse = (
  vehicle: Awaited<ReturnType<typeof vehicleService.create>>,
) => ({
  ...vehicle,
  price: vehicle.price.toString(),
});

export const vehicleController = {
  async create(req: Request, res: Response): Promise<void> {
    const vehicle = await vehicleService.create({
      make: req.body.make,
      model: req.body.model,
      category: req.body.category,
      price: parsePrice(req.body.price),
      quantity: parseQuantity(req.body.quantity),
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: toVehicleResponse(vehicle),
    });
  },

  async list(req: Request, res: Response): Promise<void> {
    const vehicles = await vehicleService.listAvailable();

    res.status(200).json({
      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,
        price: vehicle.price.toString(),
      })),
    });
  },

  async search(req: Request, res: Response): Promise<void> {
    const vehicles = await vehicleService.search({
      make: typeof req.query.make === 'string' ? req.query.make : undefined,
      model: typeof req.query.model === 'string' ? req.query.model : undefined,
      category:
        typeof req.query.category === 'string' ? req.query.category : undefined,
      minPrice:
        typeof req.query.minPrice === 'string'
          ? parsePrice(req.query.minPrice)
          : undefined,
      maxPrice:
        typeof req.query.maxPrice === 'string'
          ? parsePrice(req.query.maxPrice)
          : undefined,
    });

    res.status(200).json({
      vehicles: vehicles.map((vehicle) => ({
        ...vehicle,
        price: vehicle.price.toString(),
      })),
    });
  },

  async update(req: Request, res: Response): Promise<void> {
    const vehicleId = getVehicleId(req.params.id);
    const vehicle = await vehicleService.findById(vehicleId);

    if (!vehicle) {
      throw notFound('Vehicle not found');
    }

    const updatedVehicle = await vehicleService.update(vehicleId, {
      make: req.body.make,
      model: req.body.model,
      category: req.body.category,
      price: req.body.price !== undefined ? parsePrice(req.body.price) : undefined,
      quantity:
        req.body.quantity !== undefined ? parseQuantity(req.body.quantity) : undefined,
    });

    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle: {
        ...updatedVehicle,
        price: updatedVehicle.price.toString(),
      },
    });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const vehicleId = getVehicleId(req.params.id);
    const vehicle = await vehicleService.findById(vehicleId);

    if (!vehicle) {
      throw notFound('Vehicle not found');
    }

    await vehicleService.remove(vehicleId);

    res.status(200).json({
      message: 'Vehicle deleted successfully',
    });
  },

  async purchase(req: Request, res: Response): Promise<void> {
    const vehicleId = getVehicleId(req.params.id);
    const vehicle = await vehicleService.purchase(vehicleId);

    res.status(200).json({
      message: 'Vehicle purchased successfully',
      vehicle: {
        ...vehicle,
        price: vehicle.price.toString(),
      },
    });
  },

  async restock(req: Request, res: Response): Promise<void> {
    const vehicleId = getVehicleId(req.params.id);
    const vehicle = await vehicleService.restock(vehicleId, {
      quantity: parseQuantity(req.body.quantity ?? 1),
    });

    res.status(200).json({
      message: 'Vehicle restocked successfully',
      vehicle: {
        ...vehicle,
        price: vehicle.price.toString(),
      },
    });
  },
};
