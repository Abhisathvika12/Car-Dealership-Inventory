import type { NextFunction, Request, Response } from 'express';

import { HttpError } from './httpError';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (
    err instanceof Error &&
    (err.name === 'PrismaClientInitializationError' ||
      err.message.includes("Can't reach database server"))
  ) {
    return res.status(503).json({
      message:
        'Database is unavailable. Start PostgreSQL, confirm the DATABASE_URL, and run Prisma migrations.',
    });
  }

  console.error(err);

  res.status(500).json({
    message: 'Internal server error',
  });
};
