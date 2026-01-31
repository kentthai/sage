import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';

describe('Health Endpoint', () => {
  it('GET /health returns ok status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /api returns version info', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Sage API v0.1.0');
  });
});
