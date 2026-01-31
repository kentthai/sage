import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Health Endpoint', () => {
  it('GET /health returns ok status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /health includes database pool stats', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('database');
    expect(response.body.database).toHaveProperty('totalCount');
    expect(response.body.database).toHaveProperty('idleCount');
    expect(response.body.database).toHaveProperty('waitingCount');
  });

  it('GET /api returns version info', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Sage API v0.1.0');
  });
});

describe('Error Handling', () => {
  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error).toHaveProperty('requestId');
  });

  it('returns X-Request-ID header', async () => {
    const response = await request(app).get('/health');

    expect(response.headers).toHaveProperty('x-request-id');
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('uses client-provided X-Request-ID', async () => {
    const clientRequestId = 'my-custom-request-id';
    const response = await request(app)
      .get('/health')
      .set('X-Request-ID', clientRequestId);

    expect(response.headers['x-request-id']).toBe(clientRequestId);
  });
});
