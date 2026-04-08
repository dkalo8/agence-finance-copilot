'use strict';

const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const queries = require('../db/queries');

// GET /api/v1/watchlist
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const watchlist = await queries.getWatchlistByUserId(req.userId);
    return res.status(200).json({ watchlist });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/watchlist
router.post('/', authMiddleware, async (req, res, next) => {
  const { ticker } = req.body;
  if (!ticker) return res.status(400).json({ error: 'ticker is required' });

  try {
    const item = await queries.addToWatchlist(req.userId, ticker.toUpperCase());
    return res.status(201).json(item ?? { ticker: ticker.toUpperCase() });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/watchlist/:ticker
router.delete('/:ticker', authMiddleware, async (req, res, next) => {
  try {
    await queries.removeFromWatchlist(req.userId, req.params.ticker.toUpperCase());
    return res.status(200).json({ removed: req.params.ticker.toUpperCase() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
