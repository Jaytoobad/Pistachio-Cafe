import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT } from '../../config';

export default function Terms() {
  return (
    <div className="sf-container">
      <section className="sf-section">
        <p className="sf-hero-eyebrow">Terms</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Terms of service</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 14, maxWidth: '56ch' }}>
          These terms cover ordering, payment, delivery and cancellation at {BRAND.name}.
          By placing an order you agree to them.
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 8, fontSize: '0.82rem' }}>
          Draft — review and update before publishing.
        </p>
      </section>

      <section className="sf-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>1. Ordering</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Prices are shown in Ghana cedis (GHS). We reserve the right to correct obvious pricing
              errors before dispatch. Items are subject to availability.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>2. Payment</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
            >Payment is taken at checkout through Paystack. We do not store card details on our servers.</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>3. Delivery</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Delivery times are estimates. We are not liable for delays caused by traffic, weather or
              incorrect addresses. A small delivery fee may apply.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.05rem' }}>4. Cancellation</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              You can cancel before dispatch for a full refund. Once an order is out for delivery,
              cancellation is not possible — contact us and we will arrange a refund where appropriate.
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