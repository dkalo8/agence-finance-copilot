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
