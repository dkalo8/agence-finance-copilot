import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const SEVERITY_COLOR = { high: '#e53e3e', medium: '#dd6b20', info: '#3182ce', low: '#38a169' };

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/insights')
      .then(({ data }) => setInsights(data.insights || []))
      .catch(err => setError(err.response?.data?.error || 'Failed to load insights'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="nav">
        <Link to="/">← Dashboard</Link>
        <h2>AI Insights</h2>
      </header>
      <main>
        {loading && <p>Analyzing your finances…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && insights.length === 0 && (
          <p>No insights yet. Connect your accounts to get started.</p>
        )}
        <ul className="insight-list">
          {insights.map((insight, i) => (
            <li key={i} className="insight-card">
              <span
                className="severity-badge"
                style={{ background: SEVERITY_COLOR[insight.severity] || '#718096' }}
              >
                {insight.severity || 'info'}
              </span>
              <p>{insight.message}</p>
              {insight.score !== undefined && (
                <small>Score: {(insight.score * 100).toFixed(0)}</small>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
