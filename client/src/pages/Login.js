import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess({ credential }) {
    setError('');
    try {
      const { data } = await api.post('/auth/google', { credential });
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Agence</h1>
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <div className="auth-google">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed')}
            width="100%"
          />
        </div>
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
