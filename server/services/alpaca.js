'use strict';

const Alpaca = require('@alpacahq/alpaca-trade-api');

// ALPACA_PAPER is always true — paper trading only, never real money
const alpaca = new Alpaca({
  keyId: process.env.ALPACA_KEY_ID || process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true,
  baseUrl: 'https://paper-api.alpaca.markets',
});

async function getPositions() {
  return alpaca.getPositions();
}

async function getAccount() {
  return alpaca.getAccount();
}

async function getSnapshots(symbols) {
  const arr = await alpaca.getSnapshots(symbols);
  // SDK returns array [{symbol, dailyBar, ...}]; convert to {SYMBOL: snapshot} for keyed lookup
  if (Array.isArray(arr)) {
    return arr.reduce((acc, snap) => { acc[snap.symbol] = snap; return acc; }, {});
  }
  return arr;
}

async function placeOrder(ticker, action, quantity) {
  return alpaca.createOrder({
    symbol: ticker,
    qty: quantity,
    side: action,
    type: 'market',
    time_in_force: 'day',
  });
}

async function getPortfolioHistory(period = '1M') {
  const alpacaPeriod = period === '1Y' ? '1A' : period;
  return alpaca.getPortfolioHistory({ period: alpacaPeriod, timeframe: '1D' });
}

module.exports = { getPositions, getAccount, getSnapshots, placeOrder, getPortfolioHistory };
