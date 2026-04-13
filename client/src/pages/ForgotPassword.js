import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Agence</h1>
          <h2>Check your email</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            If <strong>{email}</strong> is registered, a reset link is on its way.
          </p>
          <p><Link to="/login">Back to sign in</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Agence</h1>
        <h2>Reset password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading || !email}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p style={{ marginTop: '0.75rem' }}><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
