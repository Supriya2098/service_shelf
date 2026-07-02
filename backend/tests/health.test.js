const request = require('supertest');
const { resetTestDb } = require('./helpers');
const { createApp } = require('../src/app');

let app;

beforeEach(() => {
  resetTestDb();
  app = createApp();
});

describe('Health API', () => {
  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.platform).toBe('SERVICE SHELF');
  });

  it('GET /api/health includes cache stats', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.cache).toHaveProperty('hits');
    expect(res.body.cache).toHaveProperty('misses');
  });
});
