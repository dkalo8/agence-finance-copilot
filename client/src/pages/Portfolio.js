import { Link } from 'react-router-dom';

export default function Portfolio() {
  return (
    <div className="page">
      <header className="nav">
        <Link to="/">← Dashboard</Link>
        <h2>Portfolio</h2>
      </header>
      <main>
        <p>Portfolio view coming soon. Connect your Alpaca paper trading account to get started.</p>
      </main>
    </div>
  );
}
