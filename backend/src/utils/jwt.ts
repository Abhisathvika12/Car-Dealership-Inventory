import jwt from 'jsonwebtoken';

import type { Role } from '@prisma/client';

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;

