# 2026-03-28 — LLM-as-Judge Implementation

## What was done

Implemented `server/orchestrator/judge.js` via TDD (5 cycles).

### Files created
- `server/orchestrator/judge.js` — `runJudge(agentOutputs)` LLM synthesis layer
- `server/orchestrator/judge.test.js` — 9 tests across 5 TDD cycles

### Also added
- `@anthropic-ai/sdk@^0.80.0` to server/package.json (was missing)

## Implementation details

- Uses `claude-sonnet-4-6` model
- System prompt defines explicit scoring dimensions: actionability, urgency, crossDomainRelevance, confidence
- Sends structured JSON of all agent outputs (not concatenated text)
- Returns ranked insights array sorted by score descending
- Fallback: if Anthropic throws, returns `Object.values(agentOutputs).flat()` (raw unscored insights)

## TDD cycles
1. Returns array
2. Calls anthropic.messages.create exactly once
3. Uses a claude- model
4. Includes agent outputs as JSON in prompt (not string summary)
5. Prompt references all 4 scoring dimensions
6. Returns parsed insights from Anthropic response
7. Each insight has a score field
8. Fallback on Anthropic error returns array
9. Fallback includes insights from all non-empty agents

## Test result
- 47/47 passing (38 prior + 9 new), lint clean
- Commit: daf9095

## Next
- Remaining 4 agents: `anomalyAgent`, `goalsAgent`, `portfolioAgent`, `autopilotAgent`
- Then: server entry point, routes, DB, middleware
