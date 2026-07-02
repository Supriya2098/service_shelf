const request = require('supertest');
const jwt = require('jsonwebtoken');
const { resetTestDb, getAuthToken } = require('./helpers');
const { createApp } = require('../src/app');

let app;

beforeEach(() => {
  resetTestDb();
  app = createApp();
});

describe('Security', () => {
  it('rejects requests without auth token on protected route', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('rejects invalid JWT token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('rejects expired JWT token', async () => {
    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token expired');
  });

  it('sanitizes XSS in registration name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '<script>alert(1)</script>Safe', email: 'xss@test.com', password: 'secret1' });

    expect(res.status).toBe(201);
    expect(res.body.user.name).not.toContain('<script>');
    expect(res.body.user.name).toContain('Safe');
  });

  it('blocks non-admin from admin routes', async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('sets security headers on responses', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });
});
