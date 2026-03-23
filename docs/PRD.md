# Agence — Product Requirements Document

## Overview
Agence is a personal finance and investment copilot that deploys
multiple AI agents in parallel to analyze a user's complete financial
picture and surface prioritized, actionable insights. Users connect
bank accounts via Plaid and investment accounts via Alpaca. Agents
run simultaneously across spending, anomalies, goals, portfolio health,
and market context. An LLM-as-judge layer synthesizes all agent outputs
into a single ranked insight feed.

## The Core Insight
Robinhood and Rocket Money exist but don't talk to each other. The
connection between your spending behavior and your investment behavior
is something no current product surfaces. Agence does.

## User Types
1. Individual user — personal finance + investment tracking
2. Household user — shared dashboard with a partner

## Agent Architecture
All agents are pure functions that run in parallel via Promise.all:

- spendingAgent      — categorized spending, MoM comparisons, budget flags
- anomalyAgent       — unusual transaction detection
- goalsAgent         — savings goal pace tracking
- marketContextAgent — stock/ETF quotes, 24h change, news via Finnhub
- portfolioAgent     — concentration risk, P&L, position analysis via Alpaca
- autopilotAgent     — rule-based paper trade execution via Alpaca

## Core Features (P3 scope)
- Connect bank accounts via Plaid sandbox
- Connect paper trading account via Alpaca paper environment
- Parallel agent analysis across all six dimensions
- LLM-as-judge synthesizes outputs into prioritized insight feed
- Savings goal creation and tracking
- Autopilot paper trading with configurable rules
- Household shared dashboard (basic)

## Post-P3 Features
See @docs/TODO-post-p3.md

## User Personas
- Recent grad with first real income who wants guidance without effort
- Young professional with multiple accounts who wants proactive alerts
- Active investor who wants cross-domain insights (spending vs. portfolio)
- Couple wanting shared visibility without fully merging finances

## User Stories
- As a user, I want to connect my bank accounts so Agence pulls
  my transactions automatically without manual entry.
- As a user, I want a prioritized AI insight feed so I know what
  actually needs my attention across my full financial picture.
- As a user, I want to see my investment portfolio health alongside
  my spending so I understand my complete financial position.
- As a user, I want to enable autopilot rules so the app can
  execute paper trades on my behalf when conditions are met.
- As a household user, I want to invite my partner to a shared
  view so we can see combined finances together.

## External APIs
- Plaid: transaction data, account balances (sandbox)
- Finnhub: stock quotes, 24h price change, market news (free tier)
- Alpaca: portfolio data, paper trade execution (paper environment)
- Anthropic: LLM-as-judge synthesis layer
