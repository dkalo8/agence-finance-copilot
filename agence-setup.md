# Agence — Claude Code Setup Instructions

## Project Background

You are helping set up **Agence**, an AI-powered personal finance copilot web app built for a graduate-level course called Vibe Coding at Northeastern University. The assignment is HW4, which requires demonstrating the Claude Code workflow (Explore→Plan→Implement→Commit) and TDD practices.

**What Agence does:** Deploys multiple AI agents in parallel to analyze a user's financial data and surface prioritized, actionable insights. Users connect bank accounts via Plaid. Agents simultaneously analyze spending patterns, track savings goals, flag anomalies, and pull market context via Finnhub. An LLM-as-judge layer synthesizes agent outputs into a single recommendation feed.

**Two user types:**
- Individual users managing personal finances
- Household users who share a joint view with a partner

**Tech stack:**
- Frontend: React (`client/`)
- Backend: Node.js + Express (`server/`)
- Database: PostgreSQL
- Auth: JWT
- External APIs: Plaid (bank/transaction data), Finnhub (market data)
- Testing: Jest + Supertest

---

## Step 1: Bootstrap the Repository

Run the following commands from the repo root:

```bash
# Initialize React frontend
npx create-react-app client

# Set up Express backend
mkdir server && cd server
npm init -y
npm install express pg plaid finnhub dotenv cors jsonwebtoken bcrypt
npm install --save-dev jest supertest nodemon
cd ..

# Create folder structure
mkdir -p server/agents
mkdir -p server/orchestrator
mkdir -p server/routes
mkdir -p server/db
mkdir -p server/tests/integration
mkdir -p server/middleware
mkdir -p docs

# Create placeholder files
touch server/index.js
touch server/db/queries.js
touch server/orchestrator/index.js
touch server/agents/spendingAgent.js
touch server/agents/marketContextAgent.js
touch server/agents/anomalyAgent.js
touch server/agents/goalsAgent.js
touch server/routes/auth.js
touch server/routes/accounts.js
touch server/routes/insights.js
touch .env.example
touch .gitignore
```

Add the following to `.gitignore`:
```
node_modules/
.env
*.log
build/
```

Add the following to `.env.example`:
```
PORT=5000
DATABASE_URL=postgresql://localhost:5432/agence
JWT_SECRET=your_jwt_secret_here
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
FINNHUB_API_KEY=your_finnhub_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Make the initial commit:
```bash
git add .
git commit -m "chore: initial project scaffold"
```

---

## Step 2: Run /init

Run `/init` inside Claude Code from the repo root. Let it analyze the project structure and generate a starter CLAUDE.md. **Screenshot or copy this output** — it is a required deliverable for the assignment.

---

## Step 3: Create CLAUDE.md

After `/init` generates a starter, replace or extend it with the following. This is the final CLAUDE.md for Agence:

```markdown
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
```

---

## Step 4: Create docs/PRD.md

Create `docs/PRD.md` with the following content (this is the @import reference required by the assignment):

```markdown
# Agence — Product Requirements Document

## Overview
Agence is a personal finance web app that deploys multiple AI agents
in parallel to analyze a user's financial life and surface actionable
insights.

## User Types
1. Individual user — personal finance tracking
2. Household user — shared view with a partner

## Core Features
- Connect bank accounts via Plaid
- Parallel agent analysis: spending, anomalies, goals, market context
- LLM-as-judge synthesizes agent outputs into prioritized insight feed
- Savings goal tracking
- Household shared dashboard

## User Personas
- Recent grad with first real income who wants guidance without effort
- Young professional tracking multiple accounts who wants proactive alerts
- Couple wanting shared visibility without fully merging finances

## User Stories
- As a user, I want to connect my bank accounts so Agence pulls my
  transactions automatically without manual entry.
- As a user, I want a prioritized AI insight feed so I know what
  actually needs my attention.
- As a user, I want to set a savings goal and track whether I'm on pace.
- As a household user, I want to invite my partner to a shared view
  so we can see combined spending together.

## External APIs
- Plaid: transaction data, account balances (sandbox environment)
- Finnhub: stock quotes, 24h price change, market news
- Anthropic: LLM-as-judge synthesis layer
```

---

## Step 5: Configure Permissions

Run `/permissions` in Claude Code and configure the following allowlist:

```
Bash(npm run *)
Bash(npm test)
Bash(git add *)
Bash(git commit *)
Bash(git checkout *)
Bash(mkdir *)
Bash(touch *)
Edit(server/**)
Edit(client/src/**)
Edit(docs/**)
Read(**/*.md)
Read(**/*.json)
```

---

## Step 6: Add npm Scripts

Add the following scripts to `server/package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest --runInBand",
  "test:watch": "jest --watch --runInBand"
}
```

Commit this:
```bash
git commit -m "chore: add npm scripts and CLAUDE.md"
```

---

## What's Next (HW4 Parts 2 & 3)

Once setup is complete, proceed to:

**Part 2 — Explore→Plan→Implement→Commit:**
Use the spending analysis agent (`server/agents/spendingAgent.js`) as
your feature. Start a fresh Claude Code session, explore the existing
structure with @file references, enter plan mode, design the approach,
implement, and commit in clear stages.

**Part 3 — TDD:**
Use the market context agent (`server/agents/marketContextAgent.js`).
Write failing Jest tests first, commit them, then have Claude Code
implement the minimum code to pass, commit, refactor, commit. Repeat
per acceptance criterion.

Keep this file open as a reference throughout.
