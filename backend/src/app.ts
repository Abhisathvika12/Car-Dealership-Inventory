import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRouter } from './routes';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Car Dealership Inventory API',
      status: 'running',
      docs: {
        health: '/health',
        api: '/api',
      },
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
    });
  });

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
