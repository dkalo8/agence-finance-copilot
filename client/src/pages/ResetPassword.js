import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) { setError('Invalid reset link. Request a new one.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Agence</h1>
          <h2>Invalid link</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>This reset link is missing or malformed.</p>
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Agence</h1>
          <h2>Password updated</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Your password has been reset. Redirecting to sign in…
          </p>
          <Link to="/login">Sign in now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Agence</h1>
        <h2>Choose a new password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading || !password}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p style={{ marginTop: '0.75rem' }}><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
