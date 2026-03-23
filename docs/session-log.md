# HW4 — Annotated Claude Code Session Log

## Overview
This log covers the full Claude Code session for HW4 Parts 1–3.
Annotations in **[brackets]** mark which workflow phase each exchange demonstrates.

---

## Part 1 — Project Setup

### Reading the setup instructions
**User:** `read @agence-setup.md and follow it from Step 1 through Step 6`

**[EXPLORE]** Claude read `agence-setup.md` to understand the full project
structure before executing any commands.

### Step 1 — Bootstrap
```bash
npx create-react-app client
mkdir server && cd server
npm init -y
npm install express pg plaid finnhub dotenv cors jsonwebtoken bcrypt
npm install --save-dev jest supertest nodemon
mkdir -p server/agents server/orchestrator server/routes server/db \
         server/tests/integration server/middleware docs
touch server/index.js server/db/queries.js server/orchestrator/index.js \
      server/agents/spendingAgent.js server/agents/marketContextAgent.js \
      server/agents/anomalyAgent.js server/agents/goalsAgent.js \
      server/routes/auth.js server/routes/accounts.js server/routes/insights.js \
      .env.example .gitignore
```

**[CONTEXT MANAGEMENT]** Claude used parallel tool calls to create multiple
files simultaneously rather than sequentially — matching the CLAUDE.md rule
"Orchestrator runs agents via Promise.all — never sequentially."

### Step 3–4 — CLAUDE.md and docs/PRD.md created
CLAUDE.md was written with: tech stack, architecture, commands, coding
conventions, testing strategy, do's and don'ts, and an `@import` reference
to `@docs/PRD.md` (satisfies Part 1 requirement).

### Initial commits
```
a09dcf1 chore: initial project scaffold
846ddb3 chore: add npm scripts and CLAUDE.md
```

### Pushing to GitHub
```bash
git remote add origin git@github.com:dkalo8/cs7180_project3_agence.git
git push -u origin main
```

---

## Security Incident — API Key in .env.example

**[CONTEXT MANAGEMENT — catching mistakes]**
During a subsequent update, an actual Anthropic API key was pasted into
`.env.example`. Claude caught this before committing:

> **Claude:** Stop — security issue. `.env.example` contains what looks like
> a real Anthropic API key: `sk-ant-api03-ts29...`. `.env.example` is
> committed to git. You should immediately rotate that key.

The key was scrubbed and replaced with the placeholder before any commit.
**Lesson:** `.env.example` is intentionally committed (it's a template).
`.env` with real keys is gitignored. Never put real secrets in `.env.example`.

---

## Scaffold Expansion — New agence-setup.md

**User:** re-read `@agence-setup.md` — the project vision has expanded.
Check what's missing before proceeding with HW4.

**[EXPLORE]** Claude ran a gap analysis comparing the current file tree
against the updated setup doc:

**Missing files identified:**
- `server/agents/portfolioAgent.js`
- `server/agents/autopilotAgent.js`
- `server/orchestrator/judge.js`
- `server/routes/portfolio.js`
- `server/routes/trades.js`
- `server/middleware/auth.js`
- `server/middleware/errors.js`
- `docs/TODO-post-p3.md` (was at root, not in `docs/`)

**Missing dependency:** `@alpacahq/alpaca-trade-api`

**Files needing content updates:** `CLAUDE.md`, `docs/PRD.md`, `.env.example`

**Structural issue:** `client/` had a nested `.git` repo (created by
`create-react-app`), making it a gitlink/submodule. Fixed by removing
`client/.git` and re-adding as regular files.

```bash
npm install @alpacahq/alpaca-trade-api
rm -rf client/.git
git rm --cached client
git add client/
```

```
f33f87f chore: expand scaffold to full Agence vision (Alpaca, portfolio, autopilot)
```

---

## API Responsibility Clarification

A second revision of `agence-setup.md` clarified the API split:

| Data Need | API |
|---|---|
| Price quotes, portfolio, P&L, trades | **Alpaca** (primary) |
| Bank transactions, balances | Plaid |
| News articles, sentiment only | Finnhub (NOT price data) |
| Insight synthesis | Anthropic |

**[PLAN]** This changed the design of `marketContextAgent` — Finnhub is
non-critical and its failure should not prevent price insights from returning.
CLAUDE.md and PRD.md were updated to reflect this.

```
ca876a6 chore: update API responsibility map (Alpaca=quotes, Finnhub=news only)
```

---

## Part 2 — Explore → Plan → Implement → Commit

**Feature:** `server/agents/spendingAgent.js`

### Explore phase

**[EXPLORE]** Claude used Glob and Read tools to inspect:
- All agent files (all empty placeholders)
- `server/package.json` (Jest installed, scripts configured)
- `CLAUDE.md` (agent contract: pure functions, `(userData, marketData) => insights[]`)
- `docs/PRD.md` (spending patterns, MoM comparisons)

Key finding: no existing implementation or tests anywhere. Agent contract
requires pure functions — no DB calls, no API calls inside agents.

A design note was committed to make the Explore phase visible in git:
```
4cdd5ae explore: document spendingAgent structure and design decisions
```

### Plan phase

**[PLAN]** Designed before writing any code:

```
Input:  userData = { transactions: [{ id, amount, category, date, name }] }
Output: [{ type, message, severity }]

Acceptance criteria:
1. Returns [] for empty/missing transactions (no crash)
2. Identifies top spending category → type: 'top_category', severity: 'info'
3. Flags category > 30% of total spend → type: 'category_spike', severity: 'warning'
4. Flags MoM spend increase > 20% → type: 'monthly_increase', severity: 'warning'
5. Every insight has { type, message, severity }
```

### Implement phase — Tests first (red)

**[IMPLEMENT]** Tests written BEFORE any implementation code:

```javascript
// spendingAgent.test.js — written before spendingAgent.js had any code
it('returns empty array when transactions is empty', () => {
  const result = spendingAgent({ transactions: [] }, {});
  expect(result).toEqual([]);
});
```

Test run confirmed red (10 failures — `spendingAgent is not a function`):
```
Tests: 10 failed, 0 passed
```

```
b423f5d test: add failing unit tests for spendingAgent (red)
```

### Implement phase — Implementation (green)

```javascript
function spendingAgent(userData, marketData) {
  const transactions = userData?.transactions;
  if (!transactions || transactions.length === 0) return [];
  // ... category aggregation, top_category, category_spike, monthly_increase
}
```

```
Tests: 10 passed, 0 failed
8fec5a6 feat: implement spendingAgent (top category, spike, MoM increase)
```

### Refactor phase

Extracted three pure helper functions to reduce duplication:
- `toYearMonth(date)` — converts Date to `"YYYY-MM"` string
- `sumBy(txns)` — sums transaction amounts
- `groupByCategory(txns)` — reduces transactions into category totals

```
Tests: 10 passed (unchanged after refactor)
6e2ed54 refactor: extract helpers in spendingAgent (toYearMonth, sumBy, groupByCategory)
```

---

## Part 3 — TDD with Claude Code

**Feature:** `server/agents/marketContextAgent.js`

### TDD Cycle 1 — Empty ticker list

**[TDD — RED]** Tests written first:
```javascript
it('returns empty array when tickers is empty', () => {
  const result = marketContextAgent({ tickers: [] }, { quotes: {}, news: {} });
  expect(result).toEqual([]);
});
```
```
Tests: 3 failed  →  7590f5e test: marketContextAgent cycle 1 — empty ticker list (red)
```

**[TDD — GREEN]** Minimum implementation:
```javascript
function marketContextAgent(userData, marketData) {
  const tickers = userData?.tickers;
  if (!tickers || tickers.length === 0) return [];
  return [];
}
```
```
Tests: 3 passed  →  dbf639a feat: marketContextAgent cycle 1 — handle empty ticker list (green)
```

---

### TDD Cycle 2 — Alpaca failure

**[TDD — RED]** Tests for null/missing quotes:
```javascript
it('returns empty array when quotes is null', () => {
  const result = marketContextAgent({ tickers: ['AAPL'] }, { quotes: null });
  expect(result).toEqual([]);
});
```
```
Tests: 7 passed (stub satisfied guard clauses)
0693db7 test: marketContextAgent cycle 2 — Alpaca failure guard clauses (red)
```

**[TDD — GREEN]** Added explicit quotes guard:
```javascript
const quotes = marketData?.quotes;
if (!quotes) return [];
```
```
3c69a51 feat: marketContextAgent cycle 2 — guard against Alpaca failure (green)
```

---

### TDD Cycle 3 — Price + 24h change per ticker (Alpaca)

**[TDD — RED]** Tests requiring actual quote insights:
```javascript
it('returns a market_quote insight for each ticker', () => {
  const results = marketContextAgent({ tickers: ['AAPL', 'TSLA'] }, marketData);
  const quotes = results.filter((i) => i.type === 'market_quote');
  expect(quotes).toHaveLength(2);
});
```
```
Tests: 5 failed  →  ab8e03f test: marketContextAgent cycle 3 — price + 24h change (red)
```

**[TDD — GREEN]** Implemented ticker loop over Alpaca quotes:
```javascript
tickers.forEach((ticker) => {
  const quote = quotes[ticker];
  if (!quote) return;
  insights.push({
    type: 'market_quote',
    ticker,
    message: `${ticker} is $${quote.price.toFixed(2)}, ${direction} ${absPct}% today`,
    severity: quote.changePercent >= 0 ? 'info' : 'warning',
  });
});
```
```
Tests: 12 passed  →  3c4c087 feat: marketContextAgent cycle 3 — price + 24h change (green)
```

---

### TDD Cycle 4 — News sentiment per ticker (Finnhub)

**[TDD — RED]**
```javascript
it('returns a market_sentiment insight for each ticker with news', () => {
  const sentiments = results.filter((i) => i.type === 'market_sentiment');
  expect(sentiments).toHaveLength(2);
});
```
```
Tests: 4 failed  →  f7a94f1 test: marketContextAgent cycle 4 — news sentiment (red)
```

**[TDD — GREEN]** Added Finnhub news loop (non-critical — uses `|| {}`):
```javascript
const news = marketData?.news || {};
tickers.forEach((ticker) => {
  const article = news[ticker];
  if (!article) return;
  insights.push({
    type: 'market_sentiment',
    ticker,
    message: `${ticker} news: ${article.headline}`,
    severity: article.sentimentScore >= 0.5 ? 'info' : 'warning',
  });
});
```
```
Tests: 16 passed  →  9c7e269 feat: marketContextAgent cycle 4 — news sentiment (green)
```

---

### TDD Cycle 5 — Finnhub failure is non-critical

**[TDD — GREEN — covered by prior cycle]**
Tests confirmed that when `news` is `null`, price insights still return.
The `|| {}` guard from cycle 4 already handled this.
This demonstrates an important TDD property: writing tests for a new
criterion can reveal that the implementation already satisfies it.

```
4f2eef7 test: marketContextAgent cycle 5 — Finnhub failure non-critical (covered)
```

---

### Refactor

Collapsed two separate `forEach` loops into a single `flatMap` pass —
one pass per ticker handles both quote and sentiment, cleaner data flow:

```javascript
return tickers.flatMap((ticker) => {
  const insights = [];
  // quote logic ...
  // sentiment logic ...
  return insights;
});
```

```
Tests: 20 passed (unchanged)
4b403d9 refactor: collapse marketContextAgent into single flatMap pass per ticker
```

---

## Final Git History

```
4b403d9 refactor: collapse marketContextAgent into single flatMap pass per ticker
4f2eef7 test: marketContextAgent cycle 5 — Finnhub failure non-critical
9c7e269 feat: marketContextAgent cycle 4 — news sentiment per ticker (green)
f7a94f1 test: marketContextAgent cycle 4 — news sentiment per ticker (red)
3c4c087 feat: marketContextAgent cycle 3 — price + 24h change per ticker (green)
ab8e03f test: marketContextAgent cycle 3 — price + 24h change per ticker (red)
3c69a51 feat: marketContextAgent cycle 2 — guard against Alpaca failure (green)
0693db7 test: marketContextAgent cycle 2 — Alpaca failure guard clauses (red)
dbf639a feat: marketContextAgent cycle 1 — handle empty ticker list (green)
7590f5e test: marketContextAgent cycle 1 — empty ticker list (red)
ca876a6 chore: update API responsibility map (Alpaca=quotes, Finnhub=news only)
6e2ed54 refactor: extract helpers in spendingAgent
8fec5a6 feat: implement spendingAgent (top category, spike, MoM increase)
b423f5d test: add failing unit tests for spendingAgent (red)
4cdd5ae explore: document spendingAgent structure and design decisions
f33f87f chore: expand scaffold to full Agence vision (Alpaca, portfolio, autopilot)
ca876a6 Updated Claude.md
846ddb3 chore: add npm scripts and CLAUDE.md
a09dcf1 chore: initial project scaffold
```

---

## Context Management Strategies Used

| Strategy | When used |
|---|---|
| Reading setup files before acting | Before every phase — never assumed structure |
| Parallel tool calls | File creation, multi-file reads |
| Gap analysis before implementing | After setup doc was updated — checked current state first |
| Plan presented and approved before coding | Before both Part 2 and Part 3 |
| Stopped to confirm before destructive action | Before removing `client/.git` submodule |
| Caught security issue before commit | API key in `.env.example` |
| One logical change per commit | Every commit in Parts 2 and 3 |
