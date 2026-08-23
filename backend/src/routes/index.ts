import { Router, type Request, type Response } from 'express';

import { authRouter } from './authRoutes';
import { vehicleRouter } from './vehicleRoutes';

export const apiRouter = Router();

apiRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'API is ready',
    availableEndpoints: {
      auth: ['/api/auth/register', '/api/auth/login'],
      vehicles: [
        '/api/vehicles',
        '/api/vehicles/search',
        '/api/vehicles/:id',
        '/api/vehicles/:id/purchase',
        '/api/vehicles/:id/restock',
      ],
    },
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/vehicles', vehicleRouter);
