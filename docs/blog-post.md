# Building a Multi-Agent Finance Copilot with Claude Code

*How I built Agence — an AI-powered personal finance app where seven agents analyze your money in parallel and an LLM-as-judge tells you what actually matters.*

---

## The Problem Nobody Solved

Robinhood and Rocket Money both exist. They do not talk to each other.

Your spending behavior and your investment behavior are deeply connected. The month your restaurant spending spikes is often the same month your portfolio takes a hit. A budget blowout in discretionary categories might explain why your savings goal fell behind. A concentrated stock position might warrant reducing spending to build a cash buffer. None of this cross-domain visibility exists in any mainstream product.

That was the starting point for Agence: a personal finance copilot that holds your full financial picture — banking, investing, and goals — and surfaces what it means, not just what happened.

---

## The Architecture: Seven Agents, One Judge

The core of Agence is a parallel agent architecture. Seven specialized agents each receive a slice of financial data and produce a list of insights. They run simultaneously via `Promise.all` — no sequential bottlenecks.

```
spendingAgent     — categorized spending, month-over-month comparisons, budget flags
anomalyAgent      — large one-offs, duplicate charges, repeated identical amounts
goalsAgent        — savings goal pace, projected completion date, on-track verdict
portfolioAgent    — concentration risk, unrealized P&L, position composition
marketContextAgent — real-time price moves, news sentiment per watchlist ticker
autopilotAgent    — rule-based paper trade evaluation against live conditions
watchlistAgent    — price movers ≥3%, negative sentiment flags per tracked symbol
```

Each agent is a pure function: `(userData, marketData) => insights[]`. No side effects. No database calls. No API calls inside agents. This made unit testing trivial — every agent can be tested by passing plain JavaScript objects with no mocking infrastructure.

The orchestrator collects all seven outputs and passes them to a single LLM call (Claude Sonnet 4.6 as judge). The judge receives the raw agent outputs and ranks them by urgency, impact, and actionability — producing a single prioritized feed rather than seven separate lists.

This LLM-as-judge pattern is the key architectural choice. Without it, users would see an unranked firehose of observations. With it, the most important thing rises to the top, every time.

---

## Data Boundaries (and Why They Matter)

Agence pulls from three external APIs: Plaid for banking, Alpaca for investments, and Finnhub for news. Early on I established a strict boundary rule and encoded it in `CLAUDE.md`:

- **Plaid**: bank transactions and balances only — never investment data
- **Alpaca**: portfolio positions, quotes, paper trade execution — never banking
- **Finnhub**: news articles and sentiment scoring — never price data

This sounds obvious, but without explicit enforcement it erodes. An agent that "just quickly" checks a Plaid balance to contextualize a portfolio decision breaks the boundary and makes the agent impure. The rule stayed absolute throughout the project. Claude Code enforced it automatically — whenever I started writing something that crossed a boundary, the CLAUDE.md rule fired as context and I'd catch the violation before writing a line of code.

---

## Claude Code as a Development Partner

This was my first project built entirely with Claude Code, and it changed how I think about AI-assisted development.

### Custom Skills

I built two custom skills:

**`/add-agent`** scaffolds a new agent file, test file, orchestrator registration, and progress log update in one command. The v1 version had four gaps I found on first use — ESLint false positives in the stub, missing orchestrator check, missing progress.md update, and generic test assertions that didn't match the actual insight schema. I fixed all four in v2. Having a versioned skill that I could iterate on felt natural — it's the same feedback loop as refactoring a reusable function.

**`/run-insights`** triggers the full agent pipeline and formats the output for inspection. Useful for manual verification without going through the frontend.

### Hooks

Three hooks run automatically:
- `PreToolUse` on file edits: runs ESLint on the file being modified — catches lint errors before they accumulate
- `PostToolUse` on file edits: runs the test suite — red tests surface immediately rather than at commit time
- A Stop hook that blocks the session from ending if tests are failing

The PostToolUse test hook was the highest-leverage addition. It forced a tight red-green-refactor loop by making failing tests immediately visible after every edit. I never accumulated a pile of broken tests and had to spend an hour fixing them all at once.

### MCP Servers

`.mcp.json` registers two MCP servers:
- `@modelcontextprotocol/server-postgres` pointing at `agence_dev` — Claude can query the live schema directly, which was invaluable for debugging query behavior without context-switching to a DB GUI
- `@upstash/context7-mcp` — fetches current documentation for libraries in-context, so Claude's suggestions match the actual API rather than training data from a year ago

### Sub-Agent

`.claude/agents/insight-reviewer.md` is a custom sub-agent that reviews AI-generated insights for quality, accuracy, and actionability before they surface to the user. It runs as part of the orchestrator review loop and flags insights that are redundant, vague, or poorly prioritized.

---

## Test-Driven Development at Scale

The project has 246 tests across 24 test suites. Every feature was written test-first.

The discipline held because of the hook setup. Writing a failing test, watching it fail, implementing the minimum to make it pass, and seeing it go green — all of that happened within one file-edit cycle. The feedback loop was tight enough that TDD felt faster than writing code speculatively.

The hardest TDD moment was the orchestrator. The parallel Promise.all structure meant testing required carefully mocked agent functions that returned predictable outputs, and the LLM judge had to be mocked at the module level. Getting that right took two iterations, but once the test harness was correct, every subsequent orchestrator change was safe.

---

## The Code Review Incident

About two weeks into the project I ran a parallel multi-agent code review — four specialized agents (security, architecture, tests, frontend) reviewing the entire codebase simultaneously. One finding changed production behavior immediately.

The `marketContextAgent` had been silently returning an empty array in production for weeks.

Root cause: the orchestrator called `safeRun(marketContextAgent, marketData)` with one argument. The agent signature was `(userData, marketData)` — two parameters. So `marketData` inside the agent was always `undefined`. The early return `if (!marketData?.quotes) return []` fired on every call. Zero market insights, every time, with no error or warning anywhere.

Manual review had missed this entirely because the code looked correct when read in isolation. The architecture agent caught it by tracing the call chain from orchestrator to agent signature. That one fix restored an entire category of insights that users should have been seeing all along.

It was a reminder that parallel agent review surfaces things that sequential human review misses — not because humans are inattentive, but because tracing cross-function call contracts across files is exactly the kind of mechanical work that agents are better at.

---

## What the Frontend Caching Layer Taught Me

The app makes eight API calls on dashboard load: insights, transactions, goals, accounts, portfolio, watchlist, trades, and profile. Without caching, every navigation triggered a full refetch — 8 × ~500ms = perceptible lag on every route change.

The solution was a `sessionStorage`-backed cache layer (`apiCache.js`) with TTL-based expiry. Short TTLs for price-sensitive data (portfolio, watchlist: 2 minutes). Longer TTLs for stable data (transactions, goals: 5 minutes). Dashboard pre-warms all 8 endpoints on mount as fire-and-forget calls.

The lesson came from the mutation side. After adding a stock to a watchlist, the cache still held the pre-mutation list. The ticker was in the database, but the cache served stale data for 2 minutes. The fix was simple — call `invalidate('watchlist')` immediately after every POST or DELETE — but I missed it in four places across the codebase before a code review agent flagged it as a pattern. The rule: **every mutation must invalidate its cache key**. It's now a CLAUDE.md principle.

---

## What I'd Do Differently

**Agent output typing.** Each agent returns `insights[]` where each insight is a plain object. There's no shared type definition. When the judge prompt changed its expected insight schema, I had to manually verify that all seven agents still produced conformant objects. TypeScript interfaces or Zod schemas would have caught schema drift automatically.

**Streaming insights.** The current flow loads all seven agents and the judge before showing anything. With streaming, the judge output could be displayed token-by-token — substantially better perceived performance on the 2–4s full pipeline run.

**Real bank account.** Plaid sandbox data is static and predictable. It never has budget overruns or genuinely unusual charges. The agents work correctly, but they've never been stress-tested against messy real-world transaction data where merchant names are truncated, categories are wrong, and duplicate detection has false positives.

---

## The One-Sentence Summary

Agence works not because the agents are smart, but because the architecture keeps them honest: pure functions, strict data boundaries, parallel execution, and a judge that synthesizes instead of aggregates.

---

*Built with React, Node.js/Express, PostgreSQL, Plaid, Alpaca, Finnhub, and Anthropic Claude. Full source at github.com/dkalo8/agence-finance-copilot. Live at agence-flame.vercel.app.*
