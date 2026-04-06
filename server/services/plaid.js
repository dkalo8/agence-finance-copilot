'use strict';

const { PlaidApi, PlaidEnvironments, Configuration, Products, CountryCode } = require('plaid');

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(config);

async function createLinkToken(userId) {
  const response = await client.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Agence',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });
  return response.data;
}

async function exchangePublicToken(publicToken) {
  const response = await client.itemPublicTokenExchange({ public_token: publicToken });
  return response.data;
}

async function getTransactions(accessToken) {
  const response = await client.transactionsGet({
    access_token: accessToken,
    start_date: '2024-01-01',
    end_date: new Date().toISOString().slice(0, 10),
  });
  return response.data.transactions;
}

async function getBalances(accessToken) {
  const response = await client.accountsBalanceGet({ access_token: accessToken });
  return response.data.accounts;
}

module.exports = { createLinkToken, exchangePublicToken, getTransactions, getBalances };
