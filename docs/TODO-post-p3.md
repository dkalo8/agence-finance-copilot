# Agence — Post-P3 Roadmap

This file tracks everything intentionally scoped out of P3 due to the
April 20 deadline. Each item notes what was stubbed, what the full
implementation looks like, and rough priority for post-graduation work.

---

## 🔴 High Priority (build these first)

### Real-Money Trading via Alpaca Live
**Current state:** Alpaca integration uses paper environment only.
ALPACA_PAPER=true is hardcoded as a safety guard in .env.
**Full implementation:** Add a "Go Live" flow in settings where the user
connects their real Alpaca brokerage account via OAuth. Swap
ALPACA_BASE_URL to https://api.alpaca.markets. Add confirmation
dialogs and risk disclosures before any live order executes.
**Key consideration:** Requires Alpaca live account approval (US users
only currently). Add circuit breakers — daily loss limits that pause
autopilot if portfolio drops more than X% in a session.

### Options Analysis Agent
**Current state:** Agent file scaffolded but empty.
**Full implementation:** Pull open options positions from Alpaca.
Calculate Greeks exposure (delta, theta, vega) across the full
portfolio. Flag positions approaching expiry or with high theta burn.
Integrate with Finnhub for implied volatility data.
**Why it matters:** Options are where retail investors get hurt most.
An agent that surfaces "your theta burn this week is $340" is
genuinely valuable and doesn't exist in any consumer product.

### Personalized LLM-as-Judge
**Current state:** Judge makes a single Anthropic call with all agent
outputs and returns synthesized insights. Weights all agents equally.
**Full implementation:** Store which insights the user acts on vs.
dismisses. Fine-tune the judge prompt over time to weight agents that
produce actionable insights higher for that specific user. Eventually
this becomes a personalization layer — the app gets smarter the more
you use it.

### Mobile App
**Current state:** React web app only.
**Full implementation:** React Native app. The insight feed and
portfolio dashboard are genuinely more useful on mobile. Push
notifications for autopilot trade executions and anomaly alerts.

---

## 🟡 Medium Priority

### Cross-Domain Intelligence Agent
**Current state:** Spending agents and investment agents run in
parallel but don't reference each other's outputs.
**Full implementation:** Add a cross-domain agent that explicitly looks
for correlations — e.g., "You spent $800 on DoorDash last month while
holding $4,000 in DoorDash stock. Your spending patterns suggest you
believe in this company." or "Your tech stock concentration (67%) is
high given that 43% of your discretionary spending is also tech."
**Why it matters:** This is Agence's actual moat. No other product
does this.

### Backtesting for Autopilot Rules
**Current state:** Autopilot executes paper trades forward only.
**Full implementation:** Before activating an autopilot rule, show the
user how that rule would have performed over the past 12 months using
historical data. Helps users configure rules with realistic expectations.

### Household Mode — Full Implementation
**Current state:** Household invite flow and shared dashboard are
basic — shared transaction view only.
**Full implementation:** Separate "mine / yours / ours" transaction
categorization. Per-partner spending insights. Joint goal tracking.
Shared autopilot rules that require both partners to approve.

### Crypto Support
**Current state:** No crypto integration.
**Full implementation:** Alpaca supports 20+ crypto pairs. Add a
crypto portfolio agent. Integrate with a crypto news feed for sentiment.
Include crypto in the cross-domain intelligence agent.

---

## 🟢 Nice to Have

### Browser Extension
Let users tag transactions as they happen rather than waiting for
Plaid to sync. More immediate anomaly detection.

### Advisor Mode (B2B)
A version of the LLM-as-judge layer exposed to financial advisors
who manage multiple clients. Each advisor sees a dashboard of all
their clients' insight feeds. Potential B2B revenue model.

### Brokerage Expansion
Alpaca covers the API-first traders. Add Plaid Investments to pull
read-only portfolio data from Robinhood, Fidelity, Schwab, etc. for
users who don't want to move their accounts.

### Social / Community Layer
Anonymous benchmarking — "Users in your income bracket spend 12%
less on dining on average." Privacy-preserving aggregate insights
across the Agence user base.

---

## Architecture Decisions Made for Longevity

These decisions were made during P3 specifically to avoid rewrites later:

1. **Agents as pure functions** — trivial to add, replace, or scale
   independently. Adding a new agent is a new file, not a refactor.

2. **All agent outputs stored in DB with timestamps** — this is both
   the eval history dataset for the course and the training data that
   makes the personalized judge possible post-P3.

3. **Alpaca abstracted behind a service layer** — swapping Alpaca for
   Interactive Brokers or adding a second brokerage is a config change,
   not a rewrite.

4. **ALPACA_PAPER flag as a hard guard** — switching to real money is
   a single env var change, not a code change. The paper and live
   API specs are identical.

5. **Plaid sandbox → production** — same pattern. When ready to launch,
   swap PLAID_ENV=sandbox to PLAID_ENV=production and apply for
   Plaid production access.
