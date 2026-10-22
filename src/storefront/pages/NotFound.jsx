import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
      <Seo title="Page not found | Pistachio Cafe" description="The page you are looking for does not exist." />
      <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.75rem' }}>Page not found</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
        That page doesn\u2019t exist or has moved.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">Back home</Link>
        <Link to="/menu" className="btn btn-outline">See the menu</Link>
      </div>
    </div>
  );
}
