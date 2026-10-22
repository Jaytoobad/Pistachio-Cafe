import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { BRAND } from '../config';

export default function NotFound() {
  useDocumentTitle('Not Found | Pistachio Caf\u00e9');
  return (
    <div className="sf-container">
      <section className="sf-section" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', margin: 0 }}>404</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12, maxWidth: '36ch', marginInline: 'auto' }}>
          We could not find that page. Head back home or browse the menu.
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="sf-btn sf-btn-primary">Back to home</Link>
          <Link to="/menu" className="sf-btn sf-btn-ghost">See the menu</Link>
        </div>
        <p style={{ marginTop: 32, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{BRAND.name} &middot; {BRAND.tagline}</p>
      </section>
    </div>
  );
}