import type { Request, Response } from 'express';

import { authService } from '../services/authService';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);

    res.status(201).json({
      message: 'Account created successfully',
      ...result,
    });
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);

    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  },
};
