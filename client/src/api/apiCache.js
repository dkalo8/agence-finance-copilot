import api from './client';

const PREFIX = 'agence_';

/**
 * Fetch with sessionStorage cache.
 * @param {string} key        - cache key (no prefix needed)
 * @param {string} endpoint   - API path passed to api.get()
 * @param {number} ttlMs      - cache lifetime in ms
 * @param {Function} extract  - fn(data) => value to store (defaults to full data)
 */
export async function getCached(key, endpoint, ttlMs, extract = d => d) {
  const storageKey = PREFIX + key;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw) {
      const { value, ts } = JSON.parse(raw);
      if (Date.now() - ts < ttlMs) return value;
    }
  } catch {
    // corrupted — fall through
  }

  const { data } = await api.get(endpoint);
  const value = extract(data);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // storage full — no-op
  }
  return value;
}

export function invalidate(key) {
  sessionStorage.removeItem(PREFIX + key);
}

export function invalidateAll() {
  Object.keys(sessionStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => sessionStorage.removeItem(k));
}

// Convenience wrappers with pre-set TTLs
const MIN = 60 * 1000;

export const getPortfolio   = () => getCached('portfolio',    '/portfolio',    2 * MIN, d => d);
export const getAccounts    = () => getCached('accounts',     '/accounts',     5 * MIN, d => d.accounts || []);
export const getGoals       = () => getCached('goals',        '/goals',        5 * MIN, d => d.goals || []);
export const getTransactions = () => getCached('transactions', '/transactions', 5 * MIN, d => d.transactions || []);
export const getWatchlist   = () => getCached('watchlist',    '/watchlist',    2 * MIN, d => d.watchlist || []);
export const getHousehold   = () => getCached('household',    '/household',    5 * MIN, d => d.household);
export const getProfile     = () => getCached('profile',      '/auth/me',      5 * MIN, d => d);
export const getTradeHistory = () => getCached('trades',      '/trades',       2 * MIN, d => d.trades || []);

// Per-ticker caching: batch-fetch uncached tickers in one request, cache individually.
// Adding one ticker only fetches that ticker; existing tickers served from cache.
export async function getNews(tickers) {
  if (!tickers.length) return [];
  const now = Date.now();
  const TTL = 2 * MIN;
  const cached = {};
  const missing = [];

  for (const t of tickers) {
    const raw = sessionStorage.getItem(PREFIX + 'news_' + t);
    if (raw) {
      try {
        const { value, ts } = JSON.parse(raw);
        if (now - ts < TTL) { cached[t] = value; continue; }
      } catch { /* corrupted — re-fetch */ }
    }
    missing.push(t);
  }

  if (missing.length > 0) {
    const { data } = await api.get(`/news?tickers=${missing.join(',')}`);
    for (const item of (data.news || [])) {
      try {
        sessionStorage.setItem(PREFIX + 'news_' + item.ticker, JSON.stringify({ value: item, ts: now }));
      } catch { /* storage full */ }
      cached[item.ticker] = item;
    }
  }

  return tickers.map(t => cached[t]).filter(Boolean);
}

export function invalidateAllNews() {
  Object.keys(sessionStorage)
    .filter(k => k.startsWith(PREFIX + 'news_'))
    .forEach(k => sessionStorage.removeItem(k));
}
