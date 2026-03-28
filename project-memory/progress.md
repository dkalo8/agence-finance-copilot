# Agence — Project Progress

_Last updated: 2026-03-28_

## Status: ~10% complete

**Deadline: April 20, 2026** (CS 7180 Project 3 — 200 pts, 20% of final grade)

---

## What's Built

### Agents (2/6 complete)
- `server/agents/spendingAgent.js` — categorized spending, MoM comparisons, budget flags. Pure function, fully tested (5 TDD cycles).
- `server/agents/marketContextAgent.js` — Alpaca price quotes + Finnhub news sentiment per ticker. Pure function, fully tested (5 TDD cycles).

### Infrastructure
- `server/package.json` — all deps wired (express, pg, plaid, alpaca, finnhub, anthropic, jwt, bcrypt)
- `server/.eslintrc.json` — ESLint configured, passes clean
- Jest configured, `npm test` works
- `.env.example` — all env vars documented
- `docs/PRD.md` — full product requirements
- `CLAUDE.md` — API boundaries, rules, architecture map

---

## What's Missing (Build Order)

### 1. Orchestrator + Judge (HIGHEST PRIORITY — unblocks everything)
- `server/orchestrator/index.js` — `Promise.all` over all 6 agents, returns merged insights[]
- `server/orchestrator/judge.js` — Anthropic LLM synthesis: receives structured JSON from all agents, returns ranked insight feed with scored dimensions

### 2. Remaining 4 Agents (each via TDD cycles)
- `server/agents/anomalyAgent.js` — unusual transaction detection (Plaid data)
- `server/agents/goalsAgent.js` — savings goal pace tracking (Plaid data)
- `server/agents/portfolioAgent.js` — concentration risk, P&L, position analysis (Alpaca)
- `server/agents/autopilotAgent.js` — rule-based paper trade execution (Alpaca)

### 3. Backend Wiring
- `server/index.js` — Express app entry point, middleware mount, route registration
- `server/middleware/auth.js` — JWT verification middleware
- `server/middleware/errors.js` — centralized error handler
- `server/db/queries.js` — ALL SQL queries (schema + migrations needed first)
- `server/routes/auth.js` — POST /api/v1/auth/register, /login, /logout
- `server/routes/accounts.js` — Plaid account connections, balances
- `server/routes/portfolio.js` — Alpaca positions, P&L
- `server/routes/trades.js` — paper trade execution
- `server/routes/insights.js` — GET /api/v1/insights (calls orchestrator)

### 4. Frontend (client/)
- Still default Create React App boilerplate
- Needs: auth flow, Plaid Link integration, insights feed, portfolio view, autopilot controls, goals tracker
- Functional components only, no class components

### 5. Integration Tests
- `server/tests/integration/` is empty
- Need: auth flow, insights endpoint, orchestrator integration

### 6. CI/CD (30 rubric points — don't leave until last)
- GitHub Actions workflow
- Lint + test on every PR
- Deploy pipeline (if applicable)

---

## Rubric Breakdown (200 pts)

| Category | Points | Status |
|---|---|---|
| App quality (features, UX, functionality) | 50 | 5% done |
| AI implementation (agents, orchestrator, judge) | 45 | 20% done (2/6 agents) |
| Tech implementation (architecture, DB, auth) | 40 | 10% done |
| CI/CD + monitoring | 30 | 0% done |
| Team collaboration | 20 | N/A |
| Documentation | 15 | 60% done (PRD, session log, CLAUDE.md) |

---

## Key Architectural Decisions

See `context/decisions.md` for full rationale. Short version:

- **Pure agent functions** — agents receive data, return insights[], no side effects. Makes testing trivial.
- **Promise.all orchestration** — all 6 agents run in parallel per insight request, not sequentially
- **LLM-as-judge with scored dimensions** — judge receives structured JSON, scores on actionability/urgency/cross-domain relevance/confidence (not "rank these generically")
- **SQL quarantine** — all queries in `server/db/queries.js`, never inline SQL elsewhere
- **Paper trading only** — `ALPACA_PAPER=true` hardcoded, never exposed as a toggle

---

## Active Session Notes

_Clear this section at the start of each session and replace with current work._

**Session 2026-03-28:** Setting up project-memory structure, updating CLAUDE.md workflow, no code changes yet.
