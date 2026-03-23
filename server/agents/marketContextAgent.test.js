const marketContextAgent = require('./marketContextAgent');

describe('marketContextAgent', () => {
  describe('Cycle 1 — empty ticker list', () => {
    it('returns empty array when tickers is empty', () => {
      const result = marketContextAgent({ tickers: [] }, { quotes: {}, news: {} });
      expect(result).toEqual([]);
    });

    it('returns empty array when userData has no tickers key', () => {
      const result = marketContextAgent({}, { quotes: {}, news: {} });
      expect(result).toEqual([]);
    });

    it('returns empty array when userData is null', () => {
      const result = marketContextAgent(null, { quotes: {}, news: {} });
      expect(result).toEqual([]);
    });
  });

  describe('Cycle 2 — Alpaca failure', () => {
    it('returns empty array when marketData is null', () => {
      const result = marketContextAgent({ tickers: ['AAPL'] }, null);
      expect(result).toEqual([]);
    });

    it('returns empty array when quotes is null', () => {
      const result = marketContextAgent({ tickers: ['AAPL'] }, { quotes: null, news: {} });
      expect(result).toEqual([]);
    });

    it('returns empty array when quotes is missing entirely', () => {
      const result = marketContextAgent({ tickers: ['AAPL'] }, { news: {} });
      expect(result).toEqual([]);
    });

    it('does not throw when a specific ticker is missing from quotes', () => {
      expect(() => {
        marketContextAgent({ tickers: ['AAPL', 'TSLA'] }, { quotes: {}, news: {} });
      }).not.toThrow();
    });
  });
});
