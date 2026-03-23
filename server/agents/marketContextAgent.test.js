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
});
