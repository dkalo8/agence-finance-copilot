# 2026-04-02 — HW5: Custom Skill + MCP Integration

## What was done

### Part 1: Custom Skill — /add-agent

Created `.claude/skills/add-agent/SKILL.md` — a slash command that scaffolds new Agence agents.

**v1 → v2 iteration:**

v1 created:
- `server/agents/<agentName>.js` — pure function stub (returns [])
- `server/agents/<agentName>.test.js` — 5 TDD cycle structure with generic test.todo placeholders

v1 gap discovered (running on anomalyAgent):
- Had to manually update `project-memory/progress.md`
- Had to manually check orchestrator wiring
- ESLint `no-unused-vars` fired on stub params (needed `_` prefix)
- Cycle 3-5 stubs were too generic (same todos regardless of agent type)

v2 added:
- Uses `_param` prefix on stub params to satisfy ESLint no-unused-vars
- Checks `orchestrator/index.js` + `orchestrator/index.test.js` for wiring; patches if missing
- Updates `project-memory/progress.md` to mark agent as in-progress
- Seeds domain-specific cycle 3-5 stubs per agent name (anomalyAgent gets anomaly-specific todos, goalsAgent gets goals-specific todos, etc.)

**Tested on:**
1. `anomalyAgent` (v1 run) — 2 passing, 6 todo. Found ESLint issue and missing progress update → motivated v2
2. `goalsAgent` (v2 run) — 2 passing, 6 todo. Orchestrator already wired, progress.md updated automatically

**Full suite after both:** 51/63 passing, 12 todo (expected), lint clean

### Part 2: MCP Integration — PostgreSQL

Added PostgreSQL MCP server for DB schema inspection and query assistance.

**Setup command:**
```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/agence_dev
```

**Status:** ✓ Connected (verified via `claude mcp list`)

**Why PostgreSQL:** Directly relevant to upcoming `server/db/queries.js` work. The MCP lets Claude Code inspect the live schema, run queries to verify data shapes, and catch type mismatches before they hit the app layer.

**Configured MCP servers (project scope):**
| Server | Command | Purpose |
|---|---|---|
| context7 | `npx -y @upstash/context7-mcp` | Library documentation lookup |
| postgres | `npx -y @modelcontextprotocol/server-postgres postgresql://localhost/agence_dev` | DB schema + query assistance |

Config stored in `~/.claude.json` (global, not project-tracked).

**To reproduce:**
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/agence_dev
claude mcp list  # verify both connected
```

## Files created/modified
- `.claude/skills/add-agent/SKILL.md` — skill v2 (committed)
- `server/agents/anomalyAgent.js` + `.test.js` — scaffolded (committed)
- `server/agents/goalsAgent.js` + `.test.js` — scaffolded (committed)
- `project-memory/progress.md` — anomaly + goals marked in-progress

## Test result
- 51/63 passing, 12 todo, lint clean
- Commit: 31d65a8
