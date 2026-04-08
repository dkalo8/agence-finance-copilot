# Agence — P3 TODO Checklist

**Deadline:** April 21, 2026 | **Points:** 200 | **Current estimate:** ~118/118 tests, ~77% complete

> Ordered by dependency and rubric impact. Work top-to-bottom.

---

## ⚠️ Verify First (before coding)

- [ ] **Confirm stack approval with professor** — P3 rubric specifies Next.js, but Agence uses CRA + Express. Ask in next class.
- [x] **Confirm solo vs. pair** — other students also working solo; Team Process (25 pts) treated as free points.

---

## Phase 1: Finish Agent Layer ✅

- [x] `/add-agent portfolioAgent marketData` — scaffold via skill
- [x] Implement portfolioAgent: concentration risk (>20% position), unrealized loss (>10%), cash drag (>20% cash)
- [x] `/add-agent autopilotAgent both` — scaffold via skill
- [x] Implement autopilotAgent: rebalance signal when concentration > threshold, buy signal on 5%+ 24h dip
- [x] Run `npm run lint && npm test` — 107/107 passing

---

## Phase 2: Backend Wiring ✅ (core done, 3 routes pending)

- [x] Design DB schema: `users`, `accounts`, `goals`, `transactions`, `trades` tables
- [x] Implement `server/db/queries.js` — all SQL here, PostgreSQL MCP for schema inspection
- [x] Implement `server/middleware/auth.js` — JWT verify middleware
- [x] Implement `server/middleware/errors.js` — centralized error handler
- [x] Implement `server/index.js` — Express app, middleware mount, route registration
- [x] Implement `server/routes/auth.js` — POST /api/v1/auth/register, /login
- [x] Implement `server/routes/accounts.js` — Plaid Link token + account sync
- [x] Implement `server/routes/portfolio.js` — Alpaca positions, P&L
- [x] Implement `server/routes/trades.js` — paper trade execution
- [x] Implement `server/routes/insights.js` — GET /api/v1/insights (calls orchestrator → judge)
- [x] Integration tests in `server/tests/integration/` — 11 tests (auth round-trip + insights pipeline)

---

## Phase 3: Frontend ✅ (scaffold done, polish pending)

- [x] Set up React Router with protected routes
- [x] Auth flow: login + register pages, JWT storage
- [x] Plaid Link component: connect bank account
- [x] Insights feed: display ranked insights from judge
- [x] Portfolio view: Alpaca positions + P&L
- [x] Goals tracker: create + track savings goals
- [x] CSS / styling — dark nav, card layout, severity badges (PR #6, deployed to Vercel)

---

## Phase 4: Claude Code Features (~8 hrs, +10 pts) ✅

- [x] **Add a second custom skill** — `/run-insights` (`.claude/skills/run-insights/SKILL.md`)
- [x] **Configure hooks in `.claude/settings.json`:**
  - [x] `PreToolUse` hook: run ESLint on file edits
  - [x] `PostToolUse` hook: run tests after `git push`
- [x] **Create `.mcp.json`** in repo root with postgres + context7 config
- [x] **Create `.claude/agents/`** directory with at least 1 sub-agent (`insight-reviewer.md`)

---

## Phase 5: CI/CD & Deployment (~20 hrs, +25 pts)

- [x] Create `.github/workflows/ci.yml` with stages:
  - [x] Lint (ESLint)
  - [x] Unit tests (Jest)
  - [x] Security scan (`npm audit`)
  - [x] AI PR review (`claude-code-action`)
  - [x] Integration tests — wired into CI via `server-test` job (118/118)
- [ ] Configure Vercel project — preview deploys on PR (blocked: dkalo8 GitHub can't link to existing Vercel account; CLI deploy working at https://agence-flame.vercel.app)
- [x] Deploy backend API — Render (https://cs7180-project3-agence.onrender.com)
- [x] Deploy frontend — Vercel (https://agence-flame.vercel.app)
- [x] Set up pre-commit secrets detection — detect-secrets v1.5.0 + .secrets.baseline

---

## Phase 6: Testing Gaps (~10 hrs, +5 pts)

- [x] Configure Playwright for E2E — 4/4 tests passing against live Vercel URL (`e2e/tests/auth-flow.spec.js`)
- [x] Enable Jest coverage reporting — 70% threshold enforced in CI, ~95% actual
- [x] Add at least 3 integration tests (auth flow, insights endpoint) — 11 tests, 118/118 total

---

## Phase 7: Team Process / PRs (~4 hrs, +variable pts)

- [x] Enable branch-per-feature workflow — CSS styling done via `feat/css-styling` branch
- [x] Create GitHub Issues with acceptance criteria — Issues #1–#5 open
- [x] Open PRs for each feature — PR #6 (CSS styling) merged
- [x] Document 2 sprints (planning + retrospective) — `docs/sprint-1.md`, `docs/sprint-2.md`
- [x] Add AI disclosure metadata to PRs — included in PR #6 body

---

## Phase 9: UX/UI Polish (~12 hrs, +Application Quality pts)

### 9A: Dashboard Redesign (Schwab-style)
> Replace 3 redundant nav cards with a real financial summary dashboard

- [x] **Backend** — add `GET /api/v1/portfolio/history` route: calls Alpaca portfolio history endpoint, returns time-series data for chart (1M/3M/6M/1Y buckets)
- [x] **Frontend** — rewrite `Dashboard.js`: Total Value headline, Day Change, portfolio P/L, sparkline chart (Recharts), accounts table (bank balance from Plaid + Alpaca equity/cash), top 3 insight cards (right rail), top holdings table
- [x] **Frontend** — install Recharts (`npm install recharts`) and add `PortfolioChart.js` component with 1M/3M/6M/1Y time selectors
- [x] **Test** — unit test `portfolio/history` route; verify chart renders with mock data (147/147 passing)

### 9B: Expenses / Categories Page
> Show Plaid transactions grouped by category with MoM comparison

- [ ] **Backend** — add `GET /api/v1/transactions` route: reads `getTransactionsByUserId()`, groups by category, computes MoM delta per category
- [ ] **Frontend** — new `Expenses.js` page: category breakdown (bar chart), transaction list with date/merchant/amount/category, date range filter (This Month / Last Month / 3 Months)
- [ ] **Frontend** — add `/expenses` link to `AppNav.js`
- [ ] **Test** — unit test groupBy/MoM logic; test route returns correct shape

### 9C: Watchlist
> Let users add tickers to follow; agent analyzes them and surfaces insights

- [ ] **Backend DB** — add `watchlist (id, user_id, ticker, added_at)` table via migration script in `server/db/`
- [ ] **Backend queries** — add `addToWatchlist()`, `getWatchlistByUserId()`, `removeFromWatchlist()` to `queries.js`
- [ ] **Backend routes** — new `server/routes/watchlist.js`: `GET /api/v1/watchlist`, `POST /api/v1/watchlist`, `DELETE /api/v1/watchlist/:ticker`; register in `server/index.js`
- [ ] **Backend agent** — new `server/agents/watchlistAgent.js`: pure fn `(userData, marketData) => insights[]`; fetches Alpaca snapshots + Finnhub sentiment for watched tickers; flags movers >3%, negative sentiment, etc.
- [ ] **Orchestrator** — add `watchlistAgent` to `Promise.all` in `server/orchestrator/index.js`
- [ ] **Frontend** — new `Watchlist.js` page: ticker input + Add button, list of watched tickers with price / 24h change / sentiment badge, remove button per row
- [ ] **Frontend** — add `/watchlist` link to `AppNav.js`
- [ ] **Test** — TDD: write watchlistAgent tests first, then implement; test all 3 route methods

### 9D: AI Chat Assistant
> Interactive financial Q&A powered by Claude, with user's financial context injected

- [ ] **Backend** — new `server/routes/chat.js`: `POST /api/v1/chat` accepts `{ message, history[] }`; loads `userData` + `marketData`; calls Claude Sonnet 4.6 with system prompt injecting portfolio/balance/goals/transactions summary; returns `{ reply }`; register in `server/index.js`
- [ ] **Frontend** — new `Chat.js` page: scrollable conversation thread, message input + send, assistant/user message styling, "Analyzing..." loading state
- [ ] **Frontend** — add "Ask Agence" link to `AppNav.js`
- [ ] **Test** — mock Anthropic call in unit test; integration test verifies route shape

### 9E: Polish Pass
> Small improvements with high UX impact

- [ ] **Trade history** — add trade history tab/table to `Portfolio.js` (calls existing `GET /api/v1/trades`)
- [ ] **Empty states** — add empty state screens with CTAs: no transactions (→ connect bank), no positions (→ make first trade), no goals (→ create goal), no watchlist (→ add ticker)
- [ ] **Settings page** — new `Settings.js`: view/reconnect Plaid account, display profile info (email), sign-out button
- [ ] **Goal progress on dashboard** — show top active goal with inline progress bar in dashboard right rail (below insights)
- [ ] **Responsive CSS** — ensure all pages usable on mobile viewport (768px breakpoints)

---

## Phase 8: Documentation & Demo (~6 hrs, +10 pts)

- [x] Add Mermaid architecture diagram to README.md
- [ ] Write + publish blog post (Medium or dev.to) — 1,500+ words
- [ ] Record 5–10 min screencast
- [ ] Write 500-word individual reflection
- [ ] Submit showcase form

---

## Rubric Scorecard

| Category | Max | Est. Now | Achievable |
|---|---|---|---|
| Application Quality | 40 | 25 | 30 (Plaid/Alpaca routes still pending) |
| Claude Code Mastery | 55 | 47 | 50 (2 skills, hooks, .mcp.json, agent, 6/6 agents) |
| Testing & TDD | 30 | 28 | 28 (118 unit/integration + E2E + 95% coverage) |
| CI/CD & Production | 35 | 30 | 32 (Actions + Vercel + Render + secrets; no GitHub auto-deploy) |
| Team Process | 25 | 18 | 20 (Issues, PR, sprints, AI disclosure) |
| Documentation & Demo | 15 | 5 | 13 (diagram done; blog + video pending) |
| **Total** | **200** | **~153** | **~173** |
