import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="nav">
        <h1>Agence</h1>
        <nav>
          <Link to="/insights">Insights</Link>
          <Link to="/goals">Goals</Link>
          <Link to="/portfolio">Portfolio</Link>
          <button onClick={logout}>Sign out</button>
        </nav>
      </header>
      <main>
        <h2>Welcome back</h2>
        <p>Your financial picture, in one place.</p>
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
