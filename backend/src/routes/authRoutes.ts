import { Router } from 'express';
import { z } from 'zod';

import { authController } from '../controllers/authController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';

const authBodySchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const authRouter = Router();

authRouter.post(
  '/register',
  validateRequest(authBodySchema),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  validateRequest(authBodySchema),
  asyncHandler(authController.login),
);

