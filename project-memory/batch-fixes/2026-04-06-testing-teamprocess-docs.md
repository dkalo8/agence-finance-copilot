# Testing, Team Process, and Documentation

## Session: 2026-04-06 (continued)

## What was done

### Phase 6: Testing Gaps

#### Integration Tests
- `server/tests/integration/auth.integration.test.js` — 7 tests
  - register→login round-trip with real bcrypt + JWT (mocks only pg Pool)
  - middleware rejection: no header, tampered token, wrong-secret token
- `server/tests/integration/insights.integration.test.js` — 4 tests
  - full pipeline: JWT auth → queries.js → orchestrator → judge → response
  - verifies userData assembly from DB queries
  - 401 guard (orchestrator not called without token)
- Pre-commit hook caught test JWT strings as false positives on first commit → baseline regenerated

#### Jest Coverage Reporting
- Added `coverageThreshold` (70% all metrics) to `server/package.json`
- Added `test:coverage` script: `jest --runInBand --forceExit --coverage`
- Added `server-coverage` job to `.github/workflows/ci.yml`
- Actual coverage: ~95% statements, ~83% branches, ~85% functions, ~95% lines

#### Playwright E2E Tests
- `e2e/` directory at repo root with `@playwright/test` v1.59.1
- `playwright.config.js`: targets live Vercel URL, Chromium headless, 30s timeout, screenshot on failure
- `e2e/tests/auth-flow.spec.js` — 6 tests total:
  - 4 passing (no credentials needed): redirect to /login, login form visible, register form visible, register→dashboard flow
  - 2 skip unless E2E_EMAIL/E2E_PASSWORD set: login with credentials, navigate to insights
- Fix required: `localStorage.clear()` doesn't update React in-memory state; rewrote to use `waitForURL()` with explicit timeouts
- E2E job added to CI workflow with Chromium install + artifact upload on failure

### Phase 7: Team Process

#### GitHub Issues (#1–#5)
- #1: CSS styling (closed via PR #6)
- #2: Plaid Link integration
- #3: Alpaca portfolio + P&L route
- #4: Autopilot trade execution route
- #5: Blog post + screencast

#### Feature Branch + PR
- Branch: `feat/css-styling`
- Full CSS rewrite in `client/src/index.css` (291 lines):
  - Dark navy (#0f172a) nav, white card layout, blue (#3b82f6) accent
  - Auth pages: centered card, branded inputs, disabled state on submit
  - Dashboard: responsive card grid (auto-fill min 240px), hover effects
  - Insights: severity badges (red/amber/green), clean list layout
  - Responsive to 375px
- PR #6 created with AI disclosure metadata, merged via squash
- Deployed to Vercel (new CSS bundle: main.20915944.css)

#### Sprint Documentation
- `docs/sprint-1.md` — Sprint 1 planning + retrospective (agent layer + backend + frontend)
- `docs/sprint-2.md` — Sprint 2 planning + retrospective (CI/CD + deploy + testing + team process)

### Phase 8 (partial): Documentation
- README.md: added Mermaid architecture diagram (flowchart TD showing full stack)
- README.md: added live deployment URLs + test status summary
- `server/coverage/` added to .gitignore

## Test results
- Server: 118/118 passing, lint clean
- E2E: 4/4 passing (Playwright, Chromium, live Vercel URL)
- Coverage: ~95% statements, 70% threshold enforced in CI
- GitHub Actions: all jobs green

## Commits
- feat: add Claude Code features (Phase 4) — 289b3c1
- feat: add GitHub Actions CI workflow — 5a3aa9f
- chore: add Vercel + Render deployment config — 9e81371
- fix: enable SSL for Render PostgreSQL connection — 4ba9d0b
- test: add integration tests for auth and insights (118/118) — 0a15813
- feat: add Jest coverage reporting with 70% threshold — 2c075e2
- feat: add Playwright E2E tests (4/4 passing) — 14b25c7
- feat: add CSS styling and UI polish (#1) — a87bdbe (squash merged as 0270117)
- docs: add sprint 1+2 planning/retrospectives and update TODO — 29d682d
- docs: add Mermaid architecture diagram and live deployment URLs to README — e577576

## Next
- Phase 2: accounts.js (Plaid), portfolio.js (Alpaca), trades.js (Alpaca)
- Phase 8: blog post (Medium/dev.to), screencast (Loom/YouTube), 500-word reflection
- Optional: E2E_EMAIL/E2E_PASSWORD GitHub secrets to enable credential-based E2E tests in CI
