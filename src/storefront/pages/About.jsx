import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT } from '../config';
import Seo from '../components/Seo';

export default function About() {
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Seo title="Our story | Pistachio Cafe" description="The story of Pistachio Cafe in Spintex, Accra." />
      <section className="sf-section">
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Our story</h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          Pistachio Cafe is a neighborhood spot in {BRAND.location} serving coffee, desserts and shisha with care.
        </p>
      </section>
      <section className="sf-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gap: 16, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          <p style={{ margin: 0 }}>We focus on warm service and fresh, made-to-order treats.</p>
          <p style={{ margin: 0 }}>Find us in Spintex, Accra. You can order online for pickup or delivery.</p>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/menu" className="btn btn-primary">See the menu</Link>
          <Link to="/visit" className="btn btn-outline">Visit us</Link>
        </div>
      </section>
    </div>
  );
}
