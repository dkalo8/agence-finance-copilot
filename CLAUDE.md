# Agence — Claude Code Context

## Project Overview
AI-powered personal finance and investment copilot. Multiple parallel
agents analyze a user's complete financial picture simultaneously —
spending patterns, anomalies, savings goals, portfolio health, and
market context — and surface prioritized insights via an LLM-as-judge
synthesis layer. Users can also enable autopilot paper trading.
See @docs/PRD.md for full product context.

## Tech Stack
- Frontend: React (client/)
- Backend: Node.js + Express (server/)
- Database: PostgreSQL
- Auth: JWT
- Alpaca: primary market data source + paper trade execution
- Plaid: banking and transaction data only
- Finnhub: news and sentiment only (NOT price data)
- LLM: Anthropic Claude (orchestrator/judge.js)
- Testing: Jest + Supertest

## API Responsibility Map
- Price quotes, portfolio positions, P&L, trade execution → Alpaca
- Transaction history, bank balances → Plaid
- News articles, sentiment scoring → Finnhub
- Insight synthesis → Anthropic

## Architecture
- server/agents/           — individual AI analysis agents (pure functions)
  - spendingAgent.js       — categorized spend analysis, MoM comparisons (Plaid)
  - anomalyAgent.js        — unusual transaction detection (Plaid)
  - goalsAgent.js          — savings pace tracking (Plaid)
  - portfolioAgent.js      — concentration risk, P&L, positions (Alpaca)
  - marketContextAgent.js  — quotes, 24h change, news sentiment (Alpaca + Finnhub news)
  - autopilotAgent.js      — rule-based paper trade execution (Alpaca)
- server/orchestrator/     — parallel agent runner + LLM-as-judge synthesis
  - index.js               — runs all agents in parallel via Promise.all
  - judge.js               — Anthropic call that synthesizes agent outputs
- server/routes/           — Express API routes (/api/v1/*)
- server/db/               — all DB queries (never write SQL inline)
- server/middleware/       — JWT auth, error handling

## Commands
npm run dev        # start Express server with nodemon
npm test           # run Jest test suite
npm run test:watch # TDD mode — use during red-green-refactor

## Coding Conventions
- All DB queries go through server/db/queries.js — never inline SQL elsewhere
- Agents are pure functions: (userData, marketData) => insights[]
- Orchestrator runs agents via Promise.all — never sequentially
- Use async/await exclusively — never raw .then() chains
- Functional React components only — no class components
- All API routes follow /api/v1/:resource pattern
- Use Conventional Commits: feat:, test:, refactor:, chore:, fix:

## Testing Strategy
- TDD for all agent logic and API routes — tests written BEFORE implementation
- Unit tests live beside source files as *.test.js
- Integration tests go in server/tests/integration/
- Run npm test before every commit — never commit with failing tests

## Do's
- Use plan mode (Shift+Tab) before any feature touching 3+ files
- /compact when context reaches ~70%
- /clear when starting a completely new feature
- Commit after every meaningful unit of work
- Reference files with @ rather than describing their contents
- Keep agents as pure functions — they must be independently testable

## Don'ts
- NEVER use Finnhub for price data — Alpaca handles all quotes
- NEVER use Plaid for investment data — Alpaca handles all portfolio data
- NEVER write SQL outside server/db/queries.js
- NEVER hardcode API keys — always use process.env
- NEVER run agents sequentially — always Promise.all in orchestrator
- NEVER implement beyond what failing tests currently require
- NEVER commit directly to main
- NEVER set ALPACA_PAPER=false — paper trading only for P3
