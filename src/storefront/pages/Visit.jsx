import { Link } from 'react-router-dom';
export default function Visit() {
  return (
    <main className="page">
      <h1>Visit</h1>
      <p>Spintex, Accra, Ghana.</p>
      <Link to="/menu" className="btn btn--primary">Order now</Link>
    </main>
  );
}