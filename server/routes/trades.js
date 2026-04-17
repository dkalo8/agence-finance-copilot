'use strict';

const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const alpacaService = require('../services/alpaca');
const queries = require('../db/queries');

// POST /api/v1/trades — submit a paper trade
router.post('/', authMiddleware, async (req, res, next) => {
  const { ticker, action, quantity, orderType = 'market', limitPrice, stopPrice } = req.body;

  if (!ticker || !action || !quantity) {
    return res.status(400).json({ error: 'ticker, action, and quantity are required' });
  }
  if (!['buy', 'sell'].includes(action)) {
    return res.status(400).json({ error: 'action must be buy or sell' });
  }
  if (!['market', 'limit', 'stop', 'stop_limit'].includes(orderType)) {
    return res.status(400).json({ error: 'orderType must be market, limit, stop, or stop_limit' });
  }

  try {
    const [order, clock] = await Promise.all([
      alpacaService.placeOrder(ticker, action, quantity, orderType, limitPrice, stopPrice),
      alpacaService.getClock(),
    ]);
    let price = parseFloat(order.filled_avg_price) || 0;

    // Paper market orders fill asynchronously — filled_avg_price is 0 at submission.
    // Fall back to snapshot close price so trade history shows a real price.
    if (price === 0) {
      const snaps = await alpacaService.getSnapshots([ticker]).catch(() => ({}));
      const snap = snaps[ticker];
      if (snap) {
        const bar = snap.dailyBar || snap.DailyBar || {};
        price = parseFloat(bar.c ?? bar.ClosePrice ?? 0) || 0;
      }
    }

    await queries.createTrade(req.userId, ticker, action, quantity, price, order.id);

    const queued = !clock.is_open;
    return res.status(201).json({ orderId: order.id, queued });
  } catch (err) {
    // Extract Alpaca's error message rather than forwarding upstream status codes
    const alpacaMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.body?.message ||
      null;
    if (alpacaMsg) {
      const isAuth = /unauthorized|forbidden/i.test(alpacaMsg);
      const hint = isAuth
        ? ' — ensure your paper API key has Trading scope enabled (paper.alpaca.markets → API Keys → check Trading permission is on)'
        : '';
      return res.status(422).json({ error: alpacaMsg + hint });
    }
    next(err);
  }
});

// GET /api/v1/trades — trade history
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const trades = await queries.getTradesByUserId(req.userId);
    return res.status(200).json({ trades });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
