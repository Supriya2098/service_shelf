const request = require('supertest');
const { resetTestDb } = require('./helpers');
const { createApp } = require('../src/app');

let app;

beforeEach(() => {
  resetTestDb();
  app = createApp();
});

describe('Services API', () => {
  it('GET /api/services returns service list', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].slug).toBe('ac-service-repair');
  });

  it('GET /api/services/categories returns categories', async () => {
    const res = await request(app).get('/api/services/categories');
    expect(res.status).toBe(200);
    expect(res.body[0].slug).toBe('home-services');
  });

  it('GET /api/services/:slug returns service detail', async () => {
    const res = await request(app).get('/api/services/ac-service-repair');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('AC Service');
    expect(res.body.features).toContain('Filter cleaning');
  });

  it('GET /api/services/:slug returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/services/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /api/services uses cache on second request', async () => {
    const res1 = await request(app).get('/api/services');
    expect(res1.headers['x-cache']).toBe('MISS');

    const res2 = await request(app).get('/api/services');
    expect(res2.headers['x-cache']).toBe('HIT');
  });

  it('GET /api/services/:slug/slots returns available slots', async () => {
    const res = await request(app).get('/api/services/ac-service-repair/slots?date=2026-07-01');
    expect(res.status).toBe(200);
    expect(res.body.available.length).toBeGreaterThan(0);
  });
});
