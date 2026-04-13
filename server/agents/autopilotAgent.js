'use strict';

/**
 * autopilotAgent — generates rule-based paper trade signals from portfolio
 * concentration and 24h price movements.
 *
 * Pure function: no side effects, no DB calls, no API calls.
 *
 * @param {Object} _userData   - { transactions, balances, goals } from Plaid (unused — reserved for future rules)
 * @param {Object} marketData  - { tickers, positions, quotes, news } from Alpaca
 * @returns {Array} signals - [{ type, action, ticker, quantity, reason }]
 */
const RISK_THRESHOLDS = {
  conservative: { concentration: 0.15, dipPct: -3 },
  moderate:     { concentration: 0.20, dipPct: -5 },
  aggressive:   { concentration: 0.30, dipPct: -8 },
};

function autopilotAgent(userData, marketData) {
  const { positions = {}, quotes = {} } = marketData;
  const tickers = Object.keys(positions);

  if (tickers.length === 0) return [];

  const risk = userData?.riskTolerance || 'moderate';
  const { concentration: concThreshold, dipPct } = RISK_THRESHOLDS[risk] || RISK_THRESHOLDS.moderate;

  const signals = [];

  // Compute total portfolio value
  let totalValue = 0;
  for (const ticker of tickers) {
    const { qty, currentPrice } = positions[ticker];
    totalValue += qty * currentPrice;
  }

  // Rebalance signal — position exceeds concentration threshold
  for (const ticker of tickers) {
    const { qty, currentPrice } = positions[ticker];
    const positionValue = qty * currentPrice;
    const pct = positionValue / totalValue;

    if (pct > concThreshold) {
      const targetValue = totalValue * concThreshold;
      const excessValue = positionValue - targetValue;
      const sharesToSell = Math.floor(excessValue / currentPrice);

      if (sharesToSell > 0 && sharesToSell < qty) {
        signals.push({
          type: 'rebalance',
          action: 'sell',
          ticker,
          quantity: sharesToSell,
          reason: `${ticker} is ${Math.round(pct * 100)}% of portfolio (${risk} threshold: ${Math.round(concThreshold * 100)}%) — trimming to rebalance`,
        });
      }
    }
  }

  // Buy-on-dip signal — 24h change below dip threshold
  for (const ticker of tickers) {
    const quote = quotes[ticker];
    if (quote && quote.change < dipPct) {
      signals.push({
        type: 'buy_dip',
        action: 'buy',
        ticker,
        quantity: 1,
        reason: `${ticker} dropped ${Math.abs(quote.change).toFixed(1)}% in 24h — opportunistic buy (${risk} profile)`,
      });
    }
  }

  return signals;
}

module.exports = autopilotAgent;
