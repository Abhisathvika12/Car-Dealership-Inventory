import type { Role, User } from '@prisma/client';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma';
import { conflict, unauthorized } from '../middleware/httpError';
import { signAuthToken } from '../utils/jwt';

type AuthInput = {
  email: string;
  password: string;
};

type AuthResult = {
  token: string;
  role: Role;
  user: {
    id: string;
    email: string;
    role: Role;
    createdAt: Date;
  };
};

const toSafeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const authService = {
  async register(input: AuthInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw conflict('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      role: user.role,
      user: toSafeUser(user),
    };
  },

  async login(input: AuthInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw unauthorized('Invalid email or password');
    }

    return {
      token: signAuthToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      role: user.role,
      user: toSafeUser(user),
    };
  },
};

