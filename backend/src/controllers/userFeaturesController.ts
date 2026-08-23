import type { Request, Response } from 'express';

import { userFeaturesService } from '../services/userFeaturesService';

export const userFeaturesController = {
  async toggleFavorite(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.sub as string;
    const vehicleId = req.params.id;

    const favorited = await userFeaturesService.toggleFavorite(userId, vehicleId);

    res.status(200).json({ favorited });
  },

  async listFavorites(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.sub as string;

    const favorites = await userFeaturesService.listFavorites(userId);

    res.status(200).json({ favorites });
  },

  async addRecentlyViewed(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.sub as string;
    const vehicleId = req.params.id;

    await userFeaturesService.addRecentlyViewed(userId, vehicleId);

    res.status(200).json({ message: 'Recorded' });
  },

  async listRecentlyViewed(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.sub as string;

    const list = await userFeaturesService.listRecentlyViewed(userId);

    res.status(200).json({ recentlyViewed: list });
  },
};
