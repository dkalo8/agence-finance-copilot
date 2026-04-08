# Session 2026-04-08 — Phase 9 UX/UI

## 9A: Dashboard Redesign ✅
- Dashboard.js rewritten: 2-col grid, equity hero, Recharts AreaChart, accounts table, holdings, insights rail
- New PortfolioChart.js: 1M/3M/6M/1Y period selectors
- New GET /api/v1/portfolio/history + getPortfolioHistory() in alpaca service
- CORS: explicit allowlist (localhost:3000 + agence-flame.vercel.app)
- Client baseURL: dev = localhost:5000/api/v1, prod = REACT_APP_API_URL
- 147 → now 152 tests

## 9B: Expenses Page ✅
- New GET /api/v1/transactions: raw transactions + backend category summary
- New Expenses.js: client-side category bars + transaction table + period filter
- Bug fix: categories computed client-side (not from backend hardcoded current-month); default period = "All" so Plaid sandbox older transactions show
- Wired /expenses in App.js + AppNav
- 152/152 tests

## Local dev CORS — unresolved
- CRA proxy + Express CORS conflict in user's env (shell REACT_APP_API_URL interference)
- All UI verification done on Vercel (agence-flame.vercel.app) + Render

## Next: 9C Watchlist, 9D AI Chat
