# Agence — AI-Powered Personal Finance Copilot

Multiple parallel agents analyze user financial data and surface prioritized insights.

## Tech Stack
- Frontend: React (client/)
- Backend: Node.js + Express (server/)
- Database: PostgreSQL
- Auth: JWT
- External APIs: Plaid (bank data), Finnhub (market data)
- Testing: Jest + Supertest

## Architecture
- server/agents/        — AI analysis agents (pure functions: (userData, marketData) => insights)
- server/orchestrator/  — parallel agent runner + LLM-as-judge
- server/routes/        — Express API routes (/api/v1/:resource pattern)
- server/db/            — ALL DB queries live here via queries.js — never write SQL anywhere else
- server/middleware/     — auth and error handling
- client/src/           — React frontend (functional components only)

## Commands
npm run dev        # Express + nodemon
npm run lint       # ESLint — run before every commit, must pass clean
npm test           # Jest — run before every commit, must pass clean
npm run test:watch # TDD mode for red-green-refactor

## Rules
- **SQL quarantine**: All queries go through server/db/queries.js. Zero exceptions.
- **Agent purity**: Agents are pure functions. No side effects, no DB calls, no API calls inside agents.
- **TDD**: Tests written BEFORE implementation. Never implement beyond what failing tests require.
- **Async/await only**: No raw .then() chains.
- **Commits**: Conventional Commits (feat:, fix:, test:, refactor:, chore:). Run `npm run lint && npm test` before every commit — both must pass. Never commit directly to main.
- Unit tests live beside source files as *.test.js
- Integration tests go in server/tests/integration/

## On Compaction
Preserve these rules above all else: SQL quarantine in queries.js, agent purity constraint, TDD workflow, async/await only.

## Reminders
- ALL DB queries go through server/db/queries.js — nowhere else
- Agents are pure functions — no side effects
