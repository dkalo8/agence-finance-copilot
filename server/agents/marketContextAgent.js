function marketContextAgent(userData, marketData) {
  const tickers = userData?.tickers;
  if (!tickers || tickers.length === 0) return [];

  const quotes = marketData?.quotes;
  if (!quotes) return [];

  return [];
}

module.exports = marketContextAgent;
