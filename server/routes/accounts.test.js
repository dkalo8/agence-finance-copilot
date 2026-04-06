'use strict';

process.env.JWT_SECRET = 'test-secret'; // pragma: allowlist secret
process.env.DATABASE_URL = 'postgresql://localhost/agence_dev';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');

jest.mock('../services/plaid');
jest.mock('../db/queries');

const plaidService = require('../services/plaid');
const queries = require('../db/queries');

const validToken = jwt.sign({ userId: 'uuid-1' }, 'test-secret');

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// POST /api/v1/accounts/link-token
// ---------------------------------------------------------------------------
describe('POST /api/v1/accounts/link-token', () => {
  test('returns 401 without a token', async () => {
    const res = await request(app).post('/api/v1/accounts/link-token');
    expect(res.status).toBe(401);
  });

  test('returns 200 with a link_token', async () => {
    plaidService.createLinkToken.mockResolvedValue({ link_token: 'link-sandbox-abc123' });

    const res = await request(app)
      .post('/api/v1/accounts/link-token')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('link_token', 'link-sandbox-abc123');
  });

  test('returns 500 when Plaid service throws', async () => {
    plaidService.createLinkToken.mockRejectedValue(new Error('Plaid error'));

    const res = await request(app)
      .post('/api/v1/accounts/link-token')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST /api/v1/accounts/exchange
// ---------------------------------------------------------------------------
describe('POST /api/v1/accounts/exchange', () => {
  test('returns 400 when public_token is missing', async () => {
    const res = await request(app)
      .post('/api/v1/accounts/exchange')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 201 and accountId after successful exchange', async () => {
    plaidService.exchangePublicToken.mockResolvedValue({
      access_token: 'access-sandbox-xyz',
      item_id: 'item-123',
    });
    plaidService.getTransactions.mockResolvedValue([
      { transaction_id: 'tx1', amount: 50, merchant_name: 'Whole Foods', personal_finance_category: { primary: 'Groceries' }, date: '2026-03-01' },
    ]);
    plaidService.getBalances.mockResolvedValue([
      { account_id: 'plaid-acc-1', balances: { current: 3000, available: 2800 } },
    ]);
    queries.createAccount.mockResolvedValue({ id: 'db-acc-uuid', user_id: 'uuid-1' });
    queries.upsertTransactions.mockResolvedValue();
    queries.upsertBalance.mockResolvedValue();

    const res = await request(app)
      .post('/api/v1/accounts/exchange')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ public_token: 'public-sandbox-token' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accountId', 'db-acc-uuid');
    expect(queries.createAccount).toHaveBeenCalledWith('uuid-1', 'access-sandbox-xyz', 'item-123', undefined);
  });

  test('syncs transactions and balance after exchange', async () => {
    plaidService.exchangePublicToken.mockResolvedValue({ access_token: 'access-xyz', item_id: 'item-456' });
    plaidService.getTransactions.mockResolvedValue([
      { transaction_id: 'tx1', amount: 100, merchant_name: 'Amazon', personal_finance_category: { primary: 'Shopping' }, date: '2026-04-01' },
    ]);
    plaidService.getBalances.mockResolvedValue([
      { account_id: 'plaid-acc-1', balances: { current: 5000, available: 4800 } },
    ]);
    queries.createAccount.mockResolvedValue({ id: 'db-acc-2' });
    queries.upsertTransactions.mockResolvedValue();
    queries.upsertBalance.mockResolvedValue();

    await request(app)
      .post('/api/v1/accounts/exchange')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ public_token: 'public-sandbox-token' });

    expect(plaidService.getTransactions).toHaveBeenCalledWith('access-xyz');
    expect(queries.upsertTransactions).toHaveBeenCalledTimes(1);
    expect(queries.upsertBalance).toHaveBeenCalledTimes(1);
  });
});
