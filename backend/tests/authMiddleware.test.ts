import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { errorHandler } from '../src/middleware/errorHandler';
import { authenticateToken } from '../src/middleware/authenticateToken';
import { requireRole } from '../src/middleware/requireRole';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const jwtMock = jwt as jest.Mocked<typeof jwt>;

describe('authentication middleware', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects requests without a bearer token', async () => {
    const app = express();

    app.get('/protected', authenticateToken, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Missing or invalid authorization token');
  });

  it('allows admins through role-protected routes', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      email: 'admin@dealer.com',
      role: 'ADMIN',
    } as never);

    const app = express();

    app.get('/protected', authenticateToken, requireRole('ADMIN'), (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('blocks non-admins from admin-only routes', async () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      email: 'buyer@dealer.com',
      role: 'USER',
    } as never);

    const app = express();

    app.get('/protected', authenticateToken, requireRole('ADMIN'), (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(errorHandler);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You do not have permission to perform this action',
    );
  });
});
