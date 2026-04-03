# HW5 Retrospective — Custom Skill + MCP Integration

**Project:** Agence (CS 7180 Project 3)  
**Date:** April 2026  
**Author:** Daniel Kalo

---

## Part 1: How the Custom Skill Changed My Workflow

The `/add-agent` skill addresses a recurring friction point: every new analysis agent requires the same setup — create a pure function stub, create a TDD test file, wire the agent into `orchestrator/index.js` and its test file, and update `project-memory/progress.md`. Done manually this takes 15–20 minutes. With the skill, it's under two minutes and deterministic.

**Scaffolding without mental overhead.** Adding `anomalyAgent` manually required remembering that Jest needs factory mocks (not auto-mock, which breaks on empty files), that ESLint's `no-unused-vars` fires on stub parameters (requiring a `_` prefix), and that the project uses a specific 5-cycle TDD structure. The skill encodes all of this.

**Catching silent orchestrator gaps.** If `orchestrator/index.js` doesn't `require` a new agent, the orchestrator runs fine but produces no output for that domain — a silent failure. The skill reads both `orchestrator/index.js` and its test file, checks for the agent's wiring, and patches if missing.

**Domain-specific test seeds.** Generic `test.todo` placeholders give no useful starting point. The v2 skill seeds domain-aware stubs per agent: `goalsAgent` gets tests around pace tracking and zero-contribution handling; `portfolioAgent` gets concentration risk and unrealized loss tests.

### v1 → v2 Iteration

v1 was written speculatively. v2 was written after running v1 on `anomalyAgent` and observing four gaps:

1. **ESLint failure** — stub param `userData` flagged as unused. Fix: `_userData` prefix in stubs.
2. **Orchestrator not checked** — had to manually verify wiring after scaffolding. v2 automates it.
3. **`progress.md` not updated** — skill created files but left tracking stale. v2 marks the agent in-progress.
4. **Generic test stubs** — identical placeholders regardless of agent type. v2 uses a per-agent lookup table.

The skill now exists not just as a time-saver but as executable documentation of the project's scaffolding conventions.

---

## Part 2: What PostgreSQL MCP Enabled

The PostgreSQL MCP (`@modelcontextprotocol/server-postgres`) connects Claude Code directly to the live `agence_dev` database — relevant for the upcoming `server/db/queries.js` work, where all SQL must live under the project's quarantine rule.

**Schema-aware query writing.** Previously, writing a query required a separate `psql` session to inspect column names and types, then mentally carrying that context while writing Node.js code. Mismatches (e.g. `merchant_name` vs `merchant`, or a `NUMERIC` column needing explicit casting) only surfaced at runtime. With the MCP, schema inspection happens inline.

**Faster TDD loop.** The project's integration tests hit a real database. Being able to run a quick `SELECT` through the MCP to verify seeded test data eliminates a context-switch that broke flow on every integration test cycle.

**Setup:**
```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/agence_dev
claude mcp list  # verify connection
```

Both the postgres and context7 MCPs are configured in `~/.claude.json` and available in every session without re-running `mcp add`.

---

## Part 3: What to Build Next

**A `/run-insights` skill** to run the full pipeline end-to-end from the CLI — load fixture data, call `runOrchestrator` then `runJudge`, pretty-print the ranked insight feed. The orchestrator and judge are tested in isolation but have never been exercised together. This would serve as both a smoke test and a demo tool for the submission.

**A `/wire-route` skill** applying the same pattern as `/add-agent` to Express routes: each route needs a file in `server/routes/`, registration in `server/index.js`, auth middleware, and an integration test. The scaffolding friction is identical.

**A `PostToolUse` hook for CI feedback.** The `gh` CLI already handles GitHub interaction (`gh run view`, `gh pr create`) without a GitHub MCP. What's missing is the loop closure after `git push`. A hook on Bash commands matching `git push` could run `gh run watch` automatically, surfacing CI results in the same session.

**Pre-commit hooks for the API boundary rule.** The invariant that Alpaca, Plaid, and Finnhub never cross responsibilities is currently enforced only by convention. A `PreToolUse` hook on commits that reads the diff and flags wrong-client imports in `server/agents/` would make it a hard check.
