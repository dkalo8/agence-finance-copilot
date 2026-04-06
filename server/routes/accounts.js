'use strict';

const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const plaidService = require('../services/plaid');
const queries = require('../db/queries');

// POST /api/v1/accounts/link-token
router.post('/link-token', authMiddleware, async (req, res, next) => {
  try {
    const data = await plaidService.createLinkToken(req.userId);
    return res.status(200).json({ link_token: data.link_token });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/accounts/exchange
router.post('/exchange', authMiddleware, async (req, res, next) => {
  const { public_token } = req.body;
  if (!public_token) {
    return res.status(400).json({ error: 'public_token is required' });
  }

  try {
    const { access_token, item_id } = await plaidService.exchangePublicToken(public_token);

    const [transactions, balances] = await Promise.all([
      plaidService.getTransactions(access_token),
      plaidService.getBalances(access_token),
    ]);

    const account = await queries.createAccount(req.userId, access_token, item_id, undefined);

    const mappedTx = transactions.map(tx => ({
      userId: req.userId,
      accountId: account.id,
      plaidTransactionId: tx.transaction_id,
      amount: tx.amount,
      merchantName: tx.merchant_name,
      category: tx.personal_finance_category?.primary ?? null,
      date: tx.date,
    }));

    await queries.upsertTransactions(mappedTx);

    await Promise.all(
      balances.map(bal =>
        queries.upsertBalance(account.id, bal.balances.current, bal.balances.available)
      )
    );

    return res.status(201).json({ accountId: account.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
