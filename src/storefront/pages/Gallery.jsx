import { Link } from 'react-router-dom';
export default function Gallery() {
  return (
    <main className="page">
      <h1>Gallery</h1>
      <Link to="/menu" className="btn btn--primary">Order now</Link>
    </main>
  );
}