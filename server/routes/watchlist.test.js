'use strict';

process.env.JWT_SECRET = 'test-secret'; // pragma: allowlist secret
process.env.DATABASE_URL = 'postgresql://localhost/agence_dev'; // pragma: allowlist secret

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');

jest.mock('../db/queries');
const queries = require('../db/queries');

const validToken = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

beforeEach(() => jest.clearAllMocks());

const WATCHLIST = [
  { id: 'w1', ticker: 'AAPL', added_at: '2026-04-01T00:00:00.000Z' },
  { id: 'w2', ticker: 'TSLA', added_at: '2026-04-02T00:00:00.000Z' },
];

describe('GET /api/v1/watchlist', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/watchlist');
    expect(res.status).toBe(401);
  });

  test('returns watchlist array', async () => {
    queries.getWatchlistByUserId.mockResolvedValue(WATCHLIST);
    const res = await request(app)
      .get('/api/v1/watchlist')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(res.body.watchlist).toHaveLength(2);
    expect(res.body.watchlist[0].ticker).toBe('AAPL');
  });
});

describe('POST /api/v1/watchlist', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/watchlist').send({ ticker: 'AAPL' });
    expect(res.status).toBe(401);
  });

  test('returns 400 when ticker missing', async () => {
    const res = await request(app)
      .post('/api/v1/watchlist')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('adds ticker and returns 201', async () => {
    queries.addToWatchlist.mockResolvedValue({ id: 'w3', ticker: 'NVDA', added_at: '2026-04-08T00:00:00.000Z' });
    const res = await request(app)
      .post('/api/v1/watchlist')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'nvda' });
    expect(res.status).toBe(201);
    expect(res.body.ticker).toBe('NVDA');
  });

  test('upcases ticker before insert', async () => {
    queries.addToWatchlist.mockResolvedValue({ id: 'w3', ticker: 'MSFT', added_at: '2026-04-08T00:00:00.000Z' });
    await request(app)
      .post('/api/v1/watchlist')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'msft' });
    expect(queries.addToWatchlist).toHaveBeenCalledWith('uuid-1', 'MSFT');
  });
});

describe('DELETE /api/v1/watchlist/:ticker', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).delete('/api/v1/watchlist/AAPL');
    expect(res.status).toBe(401);
  });

  test('removes ticker and returns 200', async () => {
    queries.removeFromWatchlist.mockResolvedValue();
    const res = await request(app)
      .delete('/api/v1/watchlist/AAPL')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(queries.removeFromWatchlist).toHaveBeenCalledWith('uuid-1', 'AAPL');
  });
});
