# Agence — P3 TODO Checklist

**Deadline:** April 21, 2026 | **Points:** 200 | **Current estimate:** ~192/192 tests, ~90% complete

> Remaining work ordered by priority. Completed phases collapsed below.

---

## Remaining Work (do in order)

### 1. 9C: Google Auth
> Add Google OAuth sign-in alongside existing email/password.

- [ ] **Backend** — add Google OAuth strategy (Passport.js or direct token verify); new route `POST /api/v1/auth/google`; exchange Google ID token → issue JWT
- [ ] **Frontend** — add "Sign in with Google" button to Login + Register pages; use `@react-oauth/google` or similar
- [ ] **DB** — `users` table: add `google_id` column (nullable) via migration
- [ ] **Tests** — mock Google token verify in unit test; integration test verifies JWT returned

### 2. 9D: Watchlist News Feed
> Surface Finnhub news directly in the UI — most contextual placement is Watchlist since users are already in market-watching mode.

- [ ] **Backend** — `GET /api/v1/news?tickers=AAPL,TSLA` — Finnhub news articles for given tickers; return `{ ticker, headline, summary, url, source, datetime, sentiment }`
- [ ] **Frontend** — collapsible "Recent News" section at bottom of `Watchlist.js`; 3–5 articles per ticker; sentiment badge (positive/negative/neutral); links open in new tab
- [ ] **Cache** — add `getNews(tickers)` to `apiCache.js` with short TTL (2 min); pre-warm on Dashboard if watchlist tickers known

### 3. 9E: Nav Redesign (dropdown grouping)
> Collapse 7 flat nav items into grouped dropdowns for a cleaner, more scalable nav.

- [ ] **Structure:**
  - Logo → `/` (Dashboard)
  - **Insights** (top-level, flagship)
  - **Money** dropdown → Expenses, Goals
  - **Markets** dropdown → Portfolio, Watchlist, News
  - **Account** → Settings (no dropdown needed)
- [ ] **Implementation** — CSS-only hover dropdowns or lightweight React state; mobile-friendly
- [ ] **Tests** — update any nav-dependent E2E selectors in Playwright

### 4. Polish backlog (lower priority)
- [ ] **Drag-and-drop goal ordering** — let user set goal priority via drag-and-drop on Goals page
- [ ] **Dashboard balance wiring** — after buying stock, dashboard should reflect updated equity, positions, and sparkline
- [ ] **Responsive CSS** — mobile breakpoints across all pages
- [ ] **Account selection** — if user has multiple Plaid or trading accounts, allow switching active account
- [ ] **Investor risk profile** — settings field for risk tolerance (conservative/moderate/aggressive); feed into autopilot agent rules
- [ ] **Goal types** — add `goal_type` column (savings/growth/speculation); display type badge

### 5. Phase 10: Documentation & Demo (deadline-sensitive)
- [ ] **Add Plaid sandbox instructions to README.md** — graders need: how to link an account, sandbox credentials, what to expect after linking
- [ ] Write + publish blog post (Medium or dev.to) — 1,500+ words
- [ ] Record 5–10 min screencast
- [ ] Write 500-word individual reflection
- [ ] Submit showcase form

---

## Rubric Scorecard

| Category | Max | Est. Now | Achievable |
|---|---|---|---|
| Application Quality | 40 | 34 | 40 (Google Auth + News + nav) |
| Claude Code Mastery | 55 | 47 | 50 (2 skills, hooks, .mcp.json, agent, 7/6 agents) |
| Testing & TDD | 30 | 28 | 28 (192 unit/integration + E2E + 89% coverage) |
| CI/CD & Production | 35 | 30 | 32 (Actions + Vercel + Render + secrets) |
| Team Process | 25 | 18 | 20 (Issues, PR, sprints, AI disclosure) |
| Documentation & Demo | 15 | 5 | 13 (diagram done; blog + video pending) |
| **Total** | **200** | **~162** | **~183** |

---

## Completed ✅

### Phases 1–7 (core build)
- Agent layer: spendingAgent, anomalyAgent, goalsAgent, portfolioAgent, marketContextAgent, autopilotAgent, watchlistAgent
- Backend: Express API, PostgreSQL, JWT auth, all routes, orchestrator + LLM-as-judge
- Frontend: React Router, auth flow, all pages, Plaid Link
- Claude Code: 2 custom skills, hooks, `.mcp.json`, sub-agent
- CI/CD: GitHub Actions (lint/test/security/AI review), Render + Vercel deploy, detect-secrets
- Testing: 192 tests (unit + integration + E2E), 89% coverage
- Team process: branch workflow, Issues #1–5, PRs, 2 sprints, AI disclosure

### Phase 8: UX/UI Polish
- **8A** Dashboard redesign — equity hero, AreaChart, accounts table, insights rail
- **8B** Expenses page — category bars + transaction table + period filter
- **8C** Watchlist — add/remove tickers, real-time prices + 24h change
- **8D** AI Chat assistant — Claude Sonnet 4.6, full financial context, floating FAB
- **8E** Bug fixes — trade 431 error, Alpaca auth, chat context, account balance display
- **8F** Watchlist real-time prices — Alpaca snapshots, green/red coloring
- **8G** Polish — trade history tab, order types, empty states, settings page, goal progress rail
- **8H** Frontend caching — `apiCache.js` sessionStorage cache, Dashboard pre-warms all 8 endpoints

### Phase 9A: Household Accounts
- DB migration, backend routes (13 tests), frontend invite/leave/remove, shared data queries

### Phase 9B: Aesthetic Redesign
- Design system (navy palette, Cormorant Garamond + Outfit), full page-by-page pass, motion
- Page title consistency, clickable insight cards with deep-link navigation to source transactions
- Anomaly detection: large transactions, duplicate charges, repeated identical charges (txId tagging)
