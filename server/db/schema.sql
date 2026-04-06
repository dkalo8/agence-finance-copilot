-- Agence Database Schema
-- Run: psql -d agence_dev -f server/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Plaid-linked bank accounts
CREATE TABLE IF NOT EXISTS accounts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plaid_access_token VARCHAR(500) NOT NULL,
  plaid_item_id      VARCHAR(255) NOT NULL,
  institution_name   VARCHAR(255),
  created_at         TIMESTAMP DEFAULT NOW()
);

-- Transactions synced from Plaid
CREATE TABLE IF NOT EXISTS transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id           UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plaid_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount               NUMERIC(10,2) NOT NULL,
  merchant_name        VARCHAR(255),
  category             VARCHAR(255),
  date                 DATE NOT NULL,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- Latest balance per account (upsert on sync)
CREATE TABLE IF NOT EXISTS balances (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
  current    NUMERIC(10,2) NOT NULL,
  available  NUMERIC(10,2),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User savings goals
CREATE TABLE IF NOT EXISTS goals (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 VARCHAR(255) NOT NULL,
  target               NUMERIC(10,2) NOT NULL,
  current              NUMERIC(10,2) DEFAULT 0,
  monthly_contribution NUMERIC(10,2) DEFAULT 0,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- Paper trades executed via Alpaca
CREATE TABLE IF NOT EXISTS trades (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker           VARCHAR(20) NOT NULL,
  action           VARCHAR(10) NOT NULL CHECK (action IN ('buy', 'sell')),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  price            NUMERIC(10,2),
  alpaca_order_id  VARCHAR(255),
  status           VARCHAR(50) DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT NOW()
);
