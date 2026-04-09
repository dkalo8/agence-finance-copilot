import { useEffect, useState } from 'react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Settings() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/auth/me').then(({ data }) => setProfile(data)).catch(() => {}),
      api.get('/accounts').then(({ data }) => setAccounts(data.accounts || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <AppNav />
      <main>
        <div className="page-header">
          <h2>Account &amp; Settings</h2>
        </div>

        {loading && <p className="muted">Loading…</p>}

        {/* Profile */}
        {profile && (
          <section className="expenses-section" style={{ marginBottom: '1.5rem' }}>
            <h3 className="dash-section-title">Profile</h3>
            <table className="tx-table">
              <tbody>
                <tr>
                  <td style={{ color: '#64748b', width: 120 }}>Email</td>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <td style={{ color: '#64748b' }}>Member since</td>
                  <td>{String(profile.createdAt).slice(0, 10)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Linked bank accounts */}
        <section className="expenses-section" style={{ marginBottom: '1.5rem' }}>
          <h3 className="dash-section-title">Linked Bank Accounts</h3>
          {!loading && accounts.length === 0 && (
            <p className="muted">No bank accounts connected. Use the dashboard to connect via Plaid.</p>
          )}
          {accounts.length > 0 && (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th className="right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id || a.plaid_account_id}>
                    <td>{a.plaid_name || a.name || 'Bank Account'}</td>
                    <td className="right">${parseFloat(a.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Sign out */}
        <section className="expenses-section">
          <h3 className="dash-section-title">Session</h3>
          <button
            onClick={logout}
            style={{ padding: '0.6rem 1.4rem', background: '#e05c5c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}
