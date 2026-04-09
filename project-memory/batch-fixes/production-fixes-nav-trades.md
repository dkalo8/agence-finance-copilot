# Production Fixes: Nav, Alpaca Degradation, Trades UI

## What was done

After deploying and testing the live app, several issues were discovered and fixed.

### Issues Found in Production

1. **Portfolio returning 500** — `getPositions()` and `getAccount()` had no `.catch()` fallbacks. If the Alpaca paper account is empty or the API errors, the whole route failed.
   - Fix: added `.catch(() => [])` and `.catch(() => ({ cash: '0', equity: '0' }))` to both calls
   - Updated portfolio test: "returns 500 when Alpaca throws" → "returns 200 with empty positions when Alpaca throws"

2. **Dashboard "Connect Bank Account" showing after connection** — `bankConnected` was React local state, reset on every page reload.
   - Fix: added `useEffect` on mount to call `GET /api/v1/accounts` and set `bankConnected=true` if accounts exist
   - Added `GET /api/v1/accounts` endpoint to `server/routes/accounts.js`

3. **Inner page nav missing links** — Portfolio, Insights, Goals pages showed only "← Dashboard" with no Insights/Goals/Portfolio links, forcing users back to dashboard to navigate.
   - Fix: created `client/src/components/AppNav.js` shared nav component with full nav links + sign out
   - Updated all inner pages (Insights, Goals, Portfolio) to use AppNav

4. **Portfolio empty state message misleading** — "Connect your Alpaca paper trading account to get started" confused users since Alpaca is connected server-side, not by the user.
   - Fix: updated message to "No open positions yet." 
   - Added simple trade form (ticker, buy/sell, quantity) directly on Portfolio page

### API Keys Required in Render (set in production)
- `ALPACA_API_KEY` + `ALPACA_SECRET_KEY` — paper trading keys from paper.alpaca.markets (code reads `ALPACA_KEY_ID || ALPACA_API_KEY`)
- `PLAID_CLIENT_ID` + `PLAID_SECRET` + `PLAID_ENV=sandbox` — from dashboard.plaid.com
- `FINNHUB_API_KEY` — from finnhub.io

### Plaid Sandbox Test Credentials (for testing Link flow)
- Username: `user_good`, Password: `pass_good` # pragma: allowlist secret
- Plaid Production access application submitted — pending Plaid review

### Architecture Note
- Alpaca is connected server-side via env vars — users never configure Alpaca credentials
- Plaid is connected per-user via the Link flow (OAuth-like, access token stored in DB)
- Finnhub is server-side only — used for news sentiment in insights
