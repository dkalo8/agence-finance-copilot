# Watchlist & News Polish

_Session: 2026-04-13 (continued)_

## What Was Built

### News Section Improvements
- **7 articles fetched per ticker** (up from 3/5) — more context for AI summary + "show more" ready without extra API call
- **3 shown by default** with per-ticker "X more articles" expand button (inline, zero extra network calls)
- **Agence Overview** (renamed from "AI Overview") — analyst-framing prompt: passes full article body text, asks "what's driving the stock / what should investors watch", not just headline recap
- `max_tokens: 150` for more complete thoughts

### Per-Ticker News Caching (`apiCache.js`)
- `getNews(tickers)` now caches per-ticker (`news_AAPL`, `news_TSLA`) instead of by full joined list
- On add: only fetches the new ticker; existing tickers served from sessionStorage cache
- On remove: instantly filters state + invalidates that ticker's cache entry — no fetch
- On refresh: `invalidateAllNews()` clears all `news_*` keys, re-fetches all
- Batch-fetches all uncached tickers in ONE API request (efficient)

### Watchlist UX
- **Alphabetical sort**: both watchlist table and news groups sorted A→Z in render
- **Search filter**: input appears when news is open; filters by ticker substring
- **Refresh button (↻)**: invalidates all news caches + re-fetches; disabled while loading
- **News auto-refreshes on add**: `refreshNews(items)` called after add; with per-ticker cache only fetches new ticker
- **News auto-removes on remove**: `setNews(prev => prev.filter(n => n.ticker !== ticker))` — instant, no fetch

### Article Selection (note for future)
- Finnhub returns articles sorted newest-first (by `datetime`), past 7 days
- No relevance/importance ranking on free tier — purely chronological
- Recency = relevance for financial news in most cases

### CSS Added
- `.news-header-row` — flex row for toggle button + controls
- `.news-controls` — search input + refresh button container  
- `.news-search-input` — small filter input
- `.news-refresh-btn` — icon button with hover/disabled states
- `.news-more-btn` — underline text button for expand/collapse
- `.news-summary` / `.news-summary-label` — Agence Overview card with green left border
