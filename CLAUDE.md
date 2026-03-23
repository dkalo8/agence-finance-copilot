# Agence — Claude Code Context

## Project Overview
AI-powered personal finance copilot. Multiple parallel agents analyze
user financial data simultaneously and surface prioritized insights.
See @docs/PRD.md for full product context.

## Tech Stack
- Frontend: React (client/)
- Backend: Node.js + Express (server/)
- Database: PostgreSQL
- Auth: JWT
- External APIs: Plaid (bank data), Finnhub (market data)
- Testing: Jest + Supertest

## Architecture
- server/agents/        — individual AI analysis agents (pure functions)
- server/orchestrator/  — parallel agent runner + LLM-as-judge
- server/routes/        — Express API routes
- server/db/            — all DB queries (never write SQL inline)
- server/middleware/    — auth and error handling
- client/src/           — React frontend

## Commands
npm run dev        # start Express server with nodemon
npm test           # run Jest test suite
npm run test:watch # TDD mode — use this during red-green-refactor

## Coding Conventions
- All DB queries go through server/db/queries.js — never write SQL inline elsewhere
- Agents are pure functions: (userData, marketData) => insights
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

## Don'ts
- NEVER write SQL outside server/db/queries.js
- NEVER hardcode API keys — always use process.env
- NEVER implement beyond what failing tests currently require
- NEVER commit directly to main
- NEVER use --force push
