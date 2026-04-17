# Agence — AI-Powered Personal Finance & Investment Copilot

Parallel agents analyze spending, anomalies, savings goals, portfolio health, and market context. LLM-as-judge synthesizes prioritized insights. Supports autopilot paper trading.
See @docs/PRD.md for full product context.

## Communication Style
Terse responses. Fragments OK. No filler, no preamble. Just the answer.

## Tech Stack
- Frontend: React (client/)
- Backend: Node.js + Express (server/)
- Database: PostgreSQL
- Auth: JWT
- LLM: Anthropic Claude (orchestrator/judge.js)
- Testing: Jest + Supertest

## API Responsibility Map — DO NOT MIX THESE UP
- **Alpaca**: price quotes, portfolio positions, P&L, trade execution (paper only)
- **Plaid**: bank balances, transaction history — NEVER investment/portfolio data
- **Finnhub**: news articles, sentiment scoring — NEVER price data
- **Anthropic**: insight synthesis via orchestrator/judge.js

## Architecture
- server/agents/        — AI analysis agents (pure functions: (userData, marketData) => insights[])
- server/orchestrator/  — parallel agent runner (Promise.all, never sequential) + LLM-as-judge
- server/routes/        — Express API routes (/api/v1/:resource pattern)
- server/db/            — ALL DB queries live here via queries.js — never write SQL anywhere else
- server/middleware/     — JWT auth, error handling
- client/src/           — React frontend (functional components only)

## Commands
npm run dev        # Express + nodemon
npm run lint       # ESLint — run before every commit, must pass clean
npm test           # Jest — run before every commit, must pass clean
npm run test:watch # TDD mode for red-green-refactor
npm run mutation   # Stryker mutation testing (targets agents/spendingAgent, anomalyAgent, goalsAgent)

## Testing Tools
- **Jest + Supertest** — unit + integration tests (*.test.js beside source, integration/ for routes)
- **fast-check** — property-based tests in `agents/agents.property.test.js`; 17 tests across all 3 core agents
- **Stryker** — mutation testing via `npm run mutation`; config in `stryker.config.json`; HTML report at `reports/mutation/mutation.html`; current score ~67%

## Rules
- **API boundaries**: Alpaca = prices/portfolio/trades. Plaid = banking/transactions. Finnhub = news/sentiment. Never cross these.
- **Paper trading only**: Never set ALPACA_PAPER=false. P3 is paper trading only.
- **SQL quarantine**: All queries go through server/db/queries.js. Zero exceptions.
- **Agent purity**: Agents are pure functions. No side effects, no DB calls, no API calls inside agents.
- **Parallel execution**: Orchestrator runs agents via Promise.all — never sequentially.
- **TDD**: Tests written BEFORE implementation. Never implement beyond what failing tests require.
- **Async/await only**: No raw .then() chains.
- **Commits**: Conventional Commits (feat:, fix:, test:, refactor:, chore:). Run `npm run lint && npm test` before every commit — both must pass. Never commit directly to main.
- Unit tests live beside source files as *.test.js
- Integration tests go in server/tests/integration/

## Dev Workflow (follow this every session, no exceptions)

1. **One task at a time** — pick the next item from `project-memory/progress.md`
2. **TDD** — write failing test first, then implement until green
3. **Verify** — run `npm run lint && npm test` in server/; both must pass clean
4. **Log** — append a note to the active `project-memory/batch-fixes/YYYY-MM-DD-*.md` (create if new session)
5. **Update progress** — update `project-memory/progress.md` to reflect current state
6. **Commit + push** — `git add`, commit with Conventional Commits format, push to `dkalo8/cs7180_project3_agence`
7. **Repeat** — pick next task

Never accumulate multiple unverified changes before committing. Small steps, verify, commit, repeat.

## Security (OWASP Top 10 Awareness)
- **A01 Broken Access Control** — all routes behind `authMiddleware`; ownership filters on all DB queries (`AND user_id = $N`)
- **A02 Cryptographic Failures** — passwords bcrypt-hashed; JWT HS256 with env secret; no plaintext secrets in code
- **A03 Injection** — all SQL parameterized via `pg` placeholders (`$1, $2`); no string-concatenated queries; SQL quarantined in `queries.js`
- **A05 Security Misconfiguration** — `helmet()` enabled; CORS restricted to known origins; `NODE_ENV=production` on Render
- **A06 Vulnerable Components** — `npm audit --audit-level=high` in CI; axios patched to 1.15.0 (CVSS 10.0 SSRF CVE)
- **A07 Auth Failures** — rate limiting on auth routes (10 req/15 min); password min 8 chars enforced; reset tokens single-use with 1h expiry
- **A09 Logging Failures** — centralized error handler in `middleware/errors.js`; errors logged server-side, never exposed to client
- **CI gates**: npm audit + detect-secrets scan + AI PR review (security-focused prompt) + insight-reviewer sub-agent

## On Compaction
Preserve these rules above all else: API boundary map (Alpaca/Plaid/Finnhub responsibilities), ALPACA_PAPER=false prohibition, SQL quarantine, agent purity, parallel execution via Promise.all.

## Reminders
- Alpaca = prices/portfolio/trades. Plaid = banking only. Finnhub = news/sentiment only.
- Never set ALPACA_PAPER=false
- ALL DB queries go through server/db/queries.js — nowhere else
- Agents are pure functions — no side effects