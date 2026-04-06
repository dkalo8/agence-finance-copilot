# Sprint 1 — Planning & Retrospective

**Dates:** 2026-03-28 – 2026-04-06  
**Goal:** Build the full agent layer, backend API, and React frontend scaffold from scratch.

---

## Sprint Planning

### Scope Selected
- Implement all 6 AI agents (spendingAgent, anomalyAgent, goalsAgent, portfolioAgent, marketContextAgent, autopilotAgent)
- Wire backend: PostgreSQL schema, queries, auth middleware, Express routes
- Scaffold React frontend: routing, auth flow, insights feed

### Approach
- TDD throughout: write failing tests first, implement until green, refactor
- One commit per logical unit — no accumulating unverified changes
- SQL quarantine: all queries in `server/db/queries.js` only
- Agent purity: pure functions, no side effects

### Definition of Done
- `npm run lint && npm test` passes clean before every commit
- Each agent has ≥5 TDD tests
- Frontend compiles on CRA dev server

---

## Sprint Retrospective

### What Was Built
- 6 agents: 37 tests covering all edge cases (concentration risk, unrealized loss, buy-on-dip, etc.)
- Orchestrator + LLM-as-judge: Promise.all parallel execution, fallback on judge failure
- Backend: 6-table PostgreSQL schema, 12 query functions, JWT auth, 4 routes
- Frontend: React Router protected routes, AuthContext, Login/Register/Dashboard/Insights pages
- **107/107 tests passing**, lint clean

### What Went Well
- TDD discipline held throughout — no tests written after the fact
- Pure agent architecture made testing trivial and kept agents decoupled
- Incremental backend build (one layer at a time) prevented cascading failures
- ESLint caught an `unused vars` issue in agent stubs before commit

### What Could Be Improved
- The `/add-agent` skill v1 had 4 gaps (ESLint false positives, missing orchestrator check, missing progress.md update, generic test stubs). Fixed in v2 before reuse.
- CRA background build verification was cumbersome — used `lsof -i :3000` as a workaround

### Velocity
- ~12 hours of focused work
- 9 commits, all conventional format

---

## AI Disclosure
This sprint used Claude Code (Claude Sonnet 4.6) for:
- Scaffolding agent stubs and test files via `/add-agent` skill
- Implementing agent logic guided by TDD red-green cycles
- Backend route implementation with supertest tests
- React component scaffolding

All architectural decisions, test assertions, and code review were performed by the human author.
