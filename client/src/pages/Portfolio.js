import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/portfolio')
      .then(({ data }) => {
        setPositions(data.positions || []);
        setSummary({ cash: data.cash, equity: data.equity });
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="nav">
        <Link to="/">← Dashboard</Link>
        <h2>Portfolio</h2>
      </header>
      <main>
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
          <p>No open positions. Connect your Alpaca paper trading account to get started.</p>
        )}

        {positions.length > 0 && (
          <table className="positions-table">
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
      </main>
    </div>
  );
}
