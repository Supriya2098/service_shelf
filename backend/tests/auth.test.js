const request = require('supertest');
const { resetTestDb } = require('./helpers');
const { createApp } = require('../src/app');

let app;

beforeEach(() => {
  resetTestDb();
  app = createApp();
});

describe('Auth API', () => {
  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('POST /api/auth/login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('POST /api/auth/register creates new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'new@test.com', password: 'secret1' });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('New User');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/register rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'not-email', password: 'secret1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  it('POST /api/auth/register rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
  });
});
