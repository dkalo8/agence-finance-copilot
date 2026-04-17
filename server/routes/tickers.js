'use strict';

const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const alpacaService = require('../services/alpaca');

// GET /api/v1/tickers/search?q=AAPL — symbol autocomplete from Alpaca asset list
router.get('/search', authMiddleware, async (req, res, next) => {
  const q = (req.query.q || '').trim();
  if (q.length < 1) return res.json({ tickers: [] });
  try {
    const tickers = await alpacaService.searchAssets(q);
    return res.json({ tickers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
