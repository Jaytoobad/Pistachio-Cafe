import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config';

export default function Privacy() {
  return (
    <div className="sf-container">
      <section className="sf-section">
        <p className="sf-hero-eyebrow">Privacy</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Privacy policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 14, maxWidth: '56ch' }}>
          How {BRAND.name} collects, uses and protects your data when you order online.
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8, fontSize: '0.82rem' }}>
          Draft — review and update before publishing.
        </p>
      </section>

      <section className="sf-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>What we collect</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Name, phone number, email and delivery address when you place an order. Email when you
              subscribe to the newsletter. We do not ask for unnecessary data.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>How we use it</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              To prepare and deliver your order, to contact you about it, and to send occasional
              updates about new dishes and events if you opted in.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>Payment</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Card details are handled by Paystack, never stored by us. We keep only the payment
              reference needed to reconcile your order.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>Your rights</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              You can ask us to delete your data, unsubscribe from the newsletter at any time, or
              request a copy of what we hold. Contact us to do so.
            </p>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/contact" className="sf-btn sf-btn-primary">Contact us</Link>
        <Link to="/delivery" className="sf-btn sf-btn-ghost">Delivery info</Link>
      </div>
    </div>
  );
}