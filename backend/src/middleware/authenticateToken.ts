import type { NextFunction, Request, Response } from 'express';

import { unauthorized } from './httpError';
import { verifyAuthToken } from '../utils/jwt';

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Missing or invalid authorization token'));
  }

  try {
    const token = header.slice('Bearer '.length);
    const payload = verifyAuthToken(token);

    req.user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return next(unauthorized('Invalid or expired authorization token'));
  }
};

