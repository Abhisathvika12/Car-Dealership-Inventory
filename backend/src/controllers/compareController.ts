import type { Request, Response } from 'express';

import { compareService } from '../services/compareService';

export const compareController = {
  async compare(req: Request, res: Response): Promise<void> {
    const ids = (req.query.ids as string | undefined)?.split(',').filter(Boolean) ?? [];

    const vehicles = await compareService.compare(ids);

    res.status(200).json({ vehicles });
  },
};
