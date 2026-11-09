import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config';
import Seo from '../components/Seo';

export default function About() {
  return (
    <div className="about-page" style={{ minHeight: '100dvh' }}>
      <Seo title="Our story | Pistachio Cafe" description="The story of Pistachio Cafe in Spintex, Accra." />

      <section className="section">
        <div className="container">
          <p className="page-hero-eyebrow">Our story</p>
          <h1 className="page-hero-title">Our story</h1>
          <p className="page-hero-desc">
            Pistachio Cafe is a neighborhood spot in {BRAND.location} serving coffee, desserts and shisha with care.
          </p>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)', maxWidth: '60ch' }}>
            We focus on warm service and fresh, made-to-order treats. Find us in Spintex, Accra. You can order online for pickup or delivery.
          </p>
          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn-primary">See the menu</Link>
            <Link to="/visit" className="btn btn-outline">Visit us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
