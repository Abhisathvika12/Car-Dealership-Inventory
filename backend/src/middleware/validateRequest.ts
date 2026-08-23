import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { badRequest } from './httpError';

export const validateRequest =
  <T>(schema: ZodSchema<T>, source: 'body' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(badRequest(result.error.issues[0]?.message ?? 'Invalid request'));
    }

    if (source === 'body') {
      req.body = result.data;
    }

    next();
  };
