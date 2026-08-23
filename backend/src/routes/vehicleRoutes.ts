import { Router } from 'express';
import { z } from 'zod';

import { vehicleController } from '../controllers/vehicleController';
import { userFeaturesController } from '../controllers/userFeaturesController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/authenticateToken';
import { requireRole } from '../middleware/requireRole';
import { validateRequest } from '../middleware/validateRequest';

const vehicleCreateSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number().nonnegative('Price must be non-negative'),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
});

const vehicleUpdateSchema = vehicleCreateSchema.partial();
const vehicleSearchQuerySchema = z.object({
  make: z.string().trim().optional(),
  model: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});
const vehicleRestockSchema = z.object({
  quantity: z.number().int().positive().optional(),
});

export const vehicleRouter = Router();

vehicleRouter.use(authenticateToken);

vehicleRouter.post(
  '/',
  requireRole('ADMIN'),
  validateRequest(vehicleCreateSchema),
  asyncHandler(vehicleController.create),
);

vehicleRouter.get('/', asyncHandler(vehicleController.list));

// Favorites
vehicleRouter.post('/:id/favorite', asyncHandler(userFeaturesController.toggleFavorite));
vehicleRouter.get('/favorites', asyncHandler(userFeaturesController.listFavorites));

// Recently viewed
vehicleRouter.post('/:id/view', asyncHandler(userFeaturesController.addRecentlyViewed));
vehicleRouter.get('/recent', asyncHandler(userFeaturesController.listRecentlyViewed));

vehicleRouter.get(
  '/search',
  validateRequest(vehicleSearchQuerySchema, 'query'),
  asyncHandler(vehicleController.search),
);

vehicleRouter.post(
  '/:id/purchase',
  asyncHandler(vehicleController.purchase),
);

vehicleRouter.post(
  '/:id/restock',
  requireRole('ADMIN'),
  validateRequest(vehicleRestockSchema),
  asyncHandler(vehicleController.restock),
);

vehicleRouter.put(
  '/:id',
  validateRequest(vehicleUpdateSchema),
  asyncHandler(vehicleController.update),
);

vehicleRouter.delete(
  '/:id',
  requireRole('ADMIN'),
  asyncHandler(vehicleController.remove),
);
