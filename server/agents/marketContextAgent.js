function marketContextAgent(userData, marketData) {
  const tickers = userData?.tickers;
  if (!tickers || tickers.length === 0) return [];

  const quotes = marketData?.quotes;
  if (!quotes) return [];

  const insights = [];

  tickers.forEach((ticker) => {
    const quote = quotes[ticker];
    if (!quote) return;

    const direction = quote.changePercent >= 0 ? 'up' : 'down';
    const absPct = Math.abs(quote.changePercent).toFixed(2);
    insights.push({
      type: 'market_quote',
      ticker,
      message: `${ticker} is $${quote.price.toFixed(2)}, ${direction} ${absPct}% today`,
      severity: quote.changePercent >= 0 ? 'info' : 'warning',
    });
  });

  return insights;
}

module.exports = marketContextAgent;
