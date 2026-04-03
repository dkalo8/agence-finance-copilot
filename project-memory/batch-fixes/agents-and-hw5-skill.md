# Agents: anomalyAgent + goalsAgent + HW5 Custom Skill

## What was done

Implemented two analysis agents via TDD and built the `/add-agent` custom Claude Code skill (v1 → v2 iteration) for HW5.

### Files created
- `server/agents/anomalyAgent.js` — flags large transactions (>$500) and duplicate charges (same merchant + amount + date)
- `server/agents/anomalyAgent.test.js` — 8 tests across 5 TDD cycles
- `server/agents/goalsAgent.js` — tracks savings goal pace; outputs goal_behind / goal_on_track / goal_no_contributions / goal_complete
- `server/agents/goalsAgent.test.js` — 8 tests across 5 TDD cycles
- `.claude/skills/add-agent/SKILL.md` — v2 skill (see below)
- `.claude/skills/add-agent/SKILL-v1.md` — v1 snapshot for HW5 evidence
- `docs/hw5-mcp-documentation.md` — HW5 Parts 1 + 2 documentation
- `docs/hw5-retrospective.md` — HW5 Part 3 retrospective

### Files modified
- `server/orchestrator/index.js` — already wired for both agents (no changes needed)
- `project-memory/progress.md` — updated to reflect completion

## /add-agent skill: v1 → v2

v1 scaffolded agent stub + TDD test file. Four gaps found running it on `anomalyAgent`:

1. ESLint `no-unused-vars` on stub params → v2 uses `_param` prefix
2. Orchestrator wiring not checked → v2 reads + patches `orchestrator/index.js` if needed
3. `progress.md` not updated → v2 marks agent as in-progress automatically
4. Generic test stubs regardless of agent type → v2 seeds domain-specific cycle 3-5 stubs

v2 tested on `goalsAgent` — all four gaps resolved.

## MCP Integration (HW5 Part 2)

Added PostgreSQL MCP server for `agence_dev` schema inspection during upcoming `queries.js` work:
```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/agence_dev
```
Context7 MCP also active (library documentation lookup). Both configured in `~/.claude.json`.

## Test result
- 63/63 passing across 6 test suites, lint clean
- Commits: f26e011 (HW5 skill + MCP), c554c44, c745558

## Next
- `portfolioAgent` — concentration risk, unrealized P&L, cash drag
- `autopilotAgent` — rebalance/buy signals
- Backend wiring: DB schema → queries.js → middleware → server/index.js → routes
