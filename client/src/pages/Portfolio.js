import { useEffect, useState } from 'react';
import api from '../api/client';
import AppNav from '../components/AppNav';

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trade form state
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function fetchPortfolio() {
    return api.get('/portfolio')
      .then(({ data }) => {
        setPositions(data.positions || []);
        setSummary({ cash: data.cash, equity: data.equity });
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load portfolio'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPortfolio(); }, []);

  async function handleTrade(e) {
    e.preventDefault();
    setTradeError('');
    setTradeSuccess('');
    if (!ticker.trim() || !quantity) {
      setTradeError('Ticker and quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/trades', {
        ticker: ticker.trim().toUpperCase(),
        action,
        quantity: parseInt(quantity, 10),
      });
      setTradeSuccess(`Order placed (ID: ${data.orderId})`);
      setTicker('');
      setQuantity('');
      setLoading(true);
      await fetchPortfolio();
    } catch (err) {
      setTradeError(err.response?.data?.error || 'Trade failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <AppNav />
      <main>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Portfolio</h2>

        {loading && <p>Loading portfolio…</p>}
        {error && <p className="error">{error}</p>}

        {summary && (
          <div className="portfolio-summary">
            <div className="summary-card">
              <span className="summary-label">Equity</span>
              <span className="summary-value">${summary.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Cash</span>
              <span className="summary-value">${summary.cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        {!loading && !error && positions.length === 0 && (
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>No open positions yet. Place a paper trade below to get started.</p>
        )}

        {positions.length > 0 && (
          <table className="positions-table" style={{ marginBottom: '2rem' }}>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Qty</th>
                <th>Avg Cost</th>
                <th>Price</th>
                <th>Market Value</th>
                <th>Unrealized P&amp;L</th>
                <th>Return</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos.ticker}>
                  <td className="ticker">{pos.ticker}</td>
                  <td>{pos.qty}</td>
                  <td>${pos.avgCost.toFixed(2)}</td>
                  <td>${pos.currentPrice.toFixed(2)}</td>
                  <td>${pos.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className={pos.unrealizedPL >= 0 ? 'gain' : 'loss'}>
                    {pos.unrealizedPL >= 0 ? '+' : ''}${pos.unrealizedPL.toFixed(2)}
                  </td>
                  <td className={pos.unrealizedPLPct >= 0 ? 'gain' : 'loss'}>
                    {pos.unrealizedPLPct >= 0 ? '+' : ''}{pos.unrealizedPLPct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Place a Paper Trade</h3>
        <form onSubmit={handleTrade} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end', maxWidth: 520 }}>
          <input
            placeholder="Ticker (e.g. AAPL)"
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            style={{ flex: '1 1 120px', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' }}
          />
          <select
            value={action}
            onChange={e => setAction(e.target.value)}
            style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' }}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="1"
            style={{ width: 80, padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem' }}
          />
          <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            {submitting ? 'Placing…' : 'Place Order'}
          </button>
        </form>
        {tradeError && <p className="error" style={{ marginTop: '0.5rem' }}>{tradeError}</p>}
        {tradeSuccess && <p style={{ color: '#16a34a', marginTop: '0.5rem', fontSize: '0.875rem' }}>{tradeSuccess}</p>}
      </main>
    </div>
  );
}
