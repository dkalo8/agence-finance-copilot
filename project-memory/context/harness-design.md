# Anthropic Harness Design — Key Takeaways for Agence

**Source**: https://www.anthropic.com/engineering/harness-design-long-running-apps
**Published**: March 24, 2026 | Author: Prithvi Rajasekaran

---

## Core Problems Solved

1. **Context degradation** — as context fills, models lose coherence and prematurely wrap up work. Not a hard limit; a behavioral degradation.
2. **Self-evaluation bias** — LLMs reliably praise their own output when asked to critique it. Structurally, a separate skeptic-tuned evaluator outperforms self-review.

---

## Generator-Evaluator Pattern (The Key Insight)

> Do NOT ask the same agent to produce and judge its own output.

- **Generator**: produces output, iterates on critique
- **Evaluator**: receives output, applies skeptical scoring, returns structured critique
- Inspired by GANs — separation of roles is the load-bearing idea

**Direct mapping to Agence:**
- Agents = generators (pure functions, produce insight arrays)
- `judge.js` = evaluator (separate context, receives structured JSON, scores against explicit criteria)
- Never collapse these into one step

---

## Critical Design Rules for judge.js

### 1. Structured JSON input — not concatenated text
```js
// BAD — don't pass this to the judge:
const input = agents.map(a => a.toString()).join('\n')

// GOOD — pass structured array:
const input = {
  spending: spendingInsights,    // [{ type, severity, message, data }]
  anomaly: anomalyInsights,
  goals: goalsInsights,
  portfolio: portfolioInsights,
  market: marketInsights,
  autopilot: autopilotInsights,
}
```

### 2. Explicit scored dimensions — not generic ranking
```
// BAD judge prompt:
"Rank these insights by importance"

// GOOD judge prompt:
"Score each insight on:
- actionability (1-5): can the user act on this today?
- urgency (1-5): time-sensitive?
- cross-domain relevance (1-5): does it connect spending + investing?
- confidence (1-5): how strong is the underlying signal?
Return top 5 by weighted score."
```

### 3. Context reset per request
- Never accumulate conversation history across users/sessions in the judge
- Each orchestrator call = fresh Anthropic client context
- If you add retry logic, use a *separate* evaluator invocation with its own prompt (not self-review in the same context)

### 4. Calibrate the judge with few-shot examples
- Out-of-box Claude evaluates poorly: rationalizes issues away, gives superficial passes
- Plan 2-3 iteration cycles on judge prompt after first integration
- Use examples of good/bad rankings with detailed breakdowns to align it

---

## Context Management (Model-Specific)

| Model | Context behavior |
|---|---|
| claude-sonnet-4-6 (current) | Treat as empirically testable — may exhibit context anxiety on long tasks |
| Opus 4.5+ | Context anxiety removed naturally |

**Implication**: design orchestrator so context management strategy is configurable, not hardcoded. Start with context reset per request; remove if unnecessary.

---

## Cost/Complexity Reference

| Config | Duration | Cost |
|---|---|---|
| Single agent | 20 min | $9 |
| Full harness (complex task) | 6 hr | $200 |
| Optimized 3-round QA cycle | 3 hr 50 min | $124.70 |

For Agence: judge adds ~$0.01-0.05 per insight synthesis call at current model pricing. Not a concern at development/demo scale.

---

## When NOT to Use an Evaluator

> Evaluators matter most when tasks are near the model's capability boundary. For simpler synthesis tasks they add cost without benefit.

For Agence MVP: start with the judge, remove retry/eval loops if baseline quality is sufficient. Don't over-engineer before validating.
