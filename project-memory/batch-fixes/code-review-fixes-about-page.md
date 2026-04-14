# Code Review Fixes + About Page

_Session: 2026-04-14_

## What Was Built

### 5b. Code Review Fixes (11 fixes from parallel multi-agent review)

#### Fix 1 — marketContextAgent single-param refactor
- Root cause: orchestrator called `safeRun(marketContextAgent, marketData)` (1 arg), but agent signature was `(userData, marketData)` — `marketData?.quotes` was `undefined` → early return `[]` → zero market insights in production
- Fix: changed signature to `function marketContextAgent(marketData)`, updated all `userData?.tickers` → `marketData?.tickers`
- `marketContextAgent.test.js`: all 20 tests updated to pass single merged object `{ tickers, quotes, news }`

#### Fix 2 — Orchestrator test: watchlistAgent coverage
- Added `watchlistAgent` mock, `mockAll()` helper, `watchlist` in return-shape assertion, data-routing assertion to `orchestrator/index.test.js`

#### Fix 3 — `invalidateInsightsCache()` after mutations
- Was exported from `insightsCache.js` but never called after mutations
- Added to: Goals (goal create, reorder rollback restore), Portfolio (after trade), Watchlist (after add AND remove), Settings (handleSaveView, handleSaveAccount, PlaidLink onSuccess)

#### Fix 4 — Retry interceptor safe-method guard
- `client/src/api/client.js`: added `isSafeMethod` guard so retry interceptor only fires for GET/HEAD/OPTIONS
- Prevents POST retries → no duplicate paper trades

#### Fix 5 — PlaidLink async/await cleanup
- `PlaidLink.js`: converted `.then()` chain to async/await IIFE with `cancelled` cleanup flag to prevent setState after unmount

#### Fix 6 — Goals reorder rollback
- Goals.js: stores `previous` state before optimistic reorder; restores on `.catch()` for network failures

#### Fix 7 — helmet security headers
- `server/index.js`: installed `helmet` package, added `app.use(helmet())`

#### Fix 8 — Password minimum length enforcement
- `server/routes/auth.js`: password ≥ 8 chars enforced on both register AND reset-password handlers
- 2 new tests in `auth.test.js` (400 on short password); `// pragma: allowlist secret` pragmas added

#### Fix 9 — updateGoalCurrent ownership filter
- `server/db/queries.js`: `updateGoalCurrent(userId, goalId, current)` adds `AND user_id = $3` to prevent cross-user mutation

#### Fix 10 — axios SSRF CVE patch
- `axios` updated to 1.15.0 in both `server/` and `client/` (patches CVSS 10.0 CVE)
- `server/package.json`: added `"overrides": { "@alpacahq/alpaca-trade-api": { "axios": "^1.15.0" } }`

#### Fix 11 — express-rate-limit
- `server/index.js`: auth routes 10 req/15 min; insights + chat 60 req/min
- `skip: () => process.env.NODE_ENV === 'test'` to avoid breaking Jest test suite

### detect-secrets hook fix (commit blocker)
- `password: 'short'` in auth.test.js flagged by detect-secrets pre-commit hook # pragma: allowlist secret
- Fix: `// pragma: allowlist secret` on both instances; `git add .secrets.baseline` after hook updated baseline

### Test count after 5b fixes
246/246 passing across all test suites

---

## About Page (`client/src/pages/About.js`) — NEW FILE

Public route `/about` (no PrivateRoute), linked in AppNav left of Insights.

### Sections
1. **Hero** — "Agents + Finance = Agence" + tagline; `clamp(2.4rem, 6vw, 3.6rem)` responsive font
2. **The Problem** — insight-card with narrative copy
3. **How It Works** — 4-step flex list (Connect → Agents run → LLM judge → You act)
4. **The Six Agents** — CSS Grid `repeat(auto-fill, minmax(300px, 1fr))`; each card: icon/name/source/what/why
5. **Navigating the App** — nav guide rows with `<code>` path labels
6. **Tech Stack** — pill badges

### Layout fixes (iterative)
- `maxWidth: 1100` (was 860 — too narrow on desktop)
- Step label: `minWidth: 200, flexShrink: 0` (was 130 + `whiteSpace:nowrap` → "LLM-as-judge synthesizes" truncated)
- Agent cards: `flexDirection:'column', alignItems:'flex-start'` override on `insight-card` (base class is `display:flex; align-items:center` row — was showing text side-by-side)

### Mobile fix (final)
- "How It Works" and "Navigating the App" rows: flex-row with `minWidth:200` labels consumed >50% of 375px viewport
- Fix: `<style>` tag with `@media (max-width: 640px)` — `.about-step-row { flex-wrap: wrap }`, `.about-step-label { min-width: unset; width: 100% }`, same for `.about-nav-row` / `.about-nav-label`
- Added `className="about-step-row/label"` and `className="about-nav-row/label"` to respective elements
- Six Agents section already mobile-friendly via CSS Grid (no changes needed)

### App.js + AppNav.js changes
- `App.js`: `<Route path="/about" element={<About />} />` (public, no PrivateRoute)
- `AppNav.js`: `<Link to="/about">About</Link>` added left of Insights
