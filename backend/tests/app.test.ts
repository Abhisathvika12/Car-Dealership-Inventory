import request from 'supertest';

import { createApp } from '../src/app';

describe('app bootstrap', () => {
  it('returns a helpful landing response at the root route', async () => {
    const app = createApp();

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Car Dealership Inventory API',
        status: 'running',
      }),
    );
  });

  it('returns the API status at /api', async () => {
    const app = createApp();

    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('API is ready');
  });
});
