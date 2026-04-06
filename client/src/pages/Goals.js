import { Link } from 'react-router-dom';

export default function Goals() {
  return (
    <div className="page">
      <header className="nav">
        <Link to="/">← Dashboard</Link>
        <h2>Goals</h2>
      </header>
      <main>
        <p>Savings goal tracking coming soon. Connect your bank via Plaid to get started.</p>
      </main>
    </div>
  );
}
