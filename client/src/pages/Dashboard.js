import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlaidLink from '../components/PlaidLink';
import AppNav from '../components/AppNav';
import api from '../api/client';

export default function Dashboard() {
  const [bankConnected, setBankConnected] = useState(false);

  useEffect(() => {
    api.get('/accounts')
      .then(({ data }) => {
        if (data.accounts && data.accounts.length > 0) setBankConnected(true);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard">
      <AppNav />
      <main>
        <h2>Welcome back</h2>
        <p>Your financial picture, in one place.</p>
        {!bankConnected && (
          <div style={{ marginBottom: '1.5rem' }}>
            <PlaidLink onSuccess={() => setBankConnected(true)} />
          </div>
        )}
        {bankConnected && <p style={{ color: '#16a34a', marginBottom: '1.5rem', fontSize: '0.9rem' }}>✓ Bank account connected</p>}
        <div className="dashboard-cards">
          <Link to="/insights" className="card">
            <h3>AI Insights</h3>
            <p>Ranked actions across spending, goals, and portfolio</p>
          </Link>
          <Link to="/goals" className="card">
            <h3>Goals</h3>
            <p>Track your savings pace</p>
          </Link>
          <Link to="/portfolio" className="card">
            <h3>Portfolio</h3>
            <p>Positions, P&amp;L, and alerts</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
