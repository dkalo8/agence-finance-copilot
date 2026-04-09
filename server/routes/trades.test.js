'use strict';

process.env.JWT_SECRET = 'test-secret'; // pragma: allowlist secret
process.env.DATABASE_URL = 'postgresql://localhost/agence_dev';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');

jest.mock('../services/alpaca');
jest.mock('../db/queries');

const alpacaService = require('../services/alpaca');
const queries = require('../db/queries');

const validToken = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

beforeEach(() => {
  jest.clearAllMocks();
  alpacaService.getSnapshots.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// POST /api/v1/trades
// ---------------------------------------------------------------------------
describe('POST /api/v1/trades', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).post('/api/v1/trades');
    expect(res.status).toBe(401);
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL' }); // missing action + quantity

    expect(res.status).toBe(400);
  });

  test('returns 400 when orderType is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL', action: 'buy', quantity: 1, orderType: 'magic' });
    expect(res.status).toBe(400);
  });

  test('passes orderType and limitPrice to placeOrder', async () => {
    alpacaService.placeOrder.mockResolvedValue({ id: 'ord-1', filled_avg_price: '148.00' });
    queries.createTrade.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL', action: 'buy', quantity: 1, orderType: 'limit', limitPrice: 148 });

    expect(res.status).toBe(201);
    expect(alpacaService.placeOrder).toHaveBeenCalledWith('AAPL', 'buy', 1, 'limit', 148, undefined);
  });

  test('returns 400 when action is not buy or sell', async () => {
    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL', action: 'hold', quantity: 1 });

    expect(res.status).toBe(400);
  });

  test('returns 201 with orderId after successful trade', async () => {
    alpacaService.placeOrder.mockResolvedValue({
      id: 'alpaca-order-123',
      filled_avg_price: '150.00',
    });
    queries.createTrade.mockResolvedValue({ id: 'trade-db-uuid' });

    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL', action: 'buy', quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('orderId', 'alpaca-order-123');
    expect(queries.createTrade).toHaveBeenCalledWith(
      'uuid-1', 'AAPL', 'buy', 5, 150.00, 'alpaca-order-123'
    );
  });

  test('uses snapshot price when filled_avg_price is 0', async () => {
    alpacaService.placeOrder.mockResolvedValue({ id: 'ord-snap', filled_avg_price: '0' });
    alpacaService.getSnapshots.mockResolvedValue({
      AAPL: { dailyBar: { c: 182.5 } },
    });
    queries.createTrade.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'AAPL', action: 'buy', quantity: 1 });

    expect(res.status).toBe(201);
    expect(queries.createTrade).toHaveBeenCalledWith(
      'uuid-1', 'AAPL', 'buy', 1, 182.5, 'ord-snap'
    );
  });

  test('returns 500 when Alpaca service throws', async () => {
    alpacaService.placeOrder.mockRejectedValue(new Error('Alpaca error'));

    const res = await request(app)
      .post('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ ticker: 'TSLA', action: 'sell', quantity: 2 });

    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// GET /api/v1/trades
// ---------------------------------------------------------------------------
describe('GET /api/v1/trades', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/trades');
    expect(res.status).toBe(401);
  });

  test('returns 200 with trade history', async () => {
    queries.getTradesByUserId.mockResolvedValue([
      { id: 'trade-1', ticker: 'AAPL', action: 'buy', quantity: 5, price: 150, created_at: '2026-04-01' },
    ]);

    const res = await request(app)
      .get('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('trades');
    expect(res.body.trades).toHaveLength(1);
    expect(res.body.trades[0]).toHaveProperty('ticker', 'AAPL');
  });

  test('returns empty array when no trades exist', async () => {
    queries.getTradesByUserId.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/trades')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.trades).toEqual([]);
  });
});
