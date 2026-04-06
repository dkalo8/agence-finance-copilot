'use strict';

process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://localhost/agence_dev';

const request = require('supertest');
const app = require('../index');

// Mock queries and bcrypt — we're testing route logic, not the DB or hashing
jest.mock('../db/queries');
jest.mock('bcrypt');

const queries = require('../db/queries');
const bcrypt = require('bcrypt');

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// POST /api/v1/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/register', () => {
  test('returns 201 and a token when email and password are provided', async () => {
    queries.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-pw');
    queries.createUser.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ password: 'secret123' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('returns 409 when email is already registered', async () => {
    queries.getUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(409);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/v1/auth/login', () => {
  test('returns 200 and a token with valid credentials', async () => {
    queries.getUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password_hash: 'hashed-pw' });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('returns 401 when user does not exist', async () => {
    queries.getUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nope@b.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  test('returns 401 when password is wrong', async () => {
    queries.getUserByEmail.mockResolvedValue({ id: 'uuid-1', email: 'a@b.com', password_hash: 'hashed-pw' });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('returns 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });
});
