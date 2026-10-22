// Draft
import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT } from '../../config';
import Seo from '../../components/Seo';

export default function Privacy() {
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Seo title="Privacy | Pistachio Cafe" description="How Pistachio Cafe collects, uses and protects your data." />
      <section className="sf-section">
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Privacy policy</h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          How {BRAND.name} collects, uses and protects your data when you order online.
        </p>
      </section>

      <section className="sf-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>What we collect</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Name, phone number, email and delivery address when you place an order. Email when you subscribe to the newsletter.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>How we use it</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              To prepare and deliver your order, to contact you about it, and to send occasional updates if you opted in.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Payment</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Card details are handled by Paystack, never stored by us. We keep only the payment reference needed to reconcile your order.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Your rights</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              You can ask us to delete your data, unsubscribe from the newsletter at any time, or request a copy of what we hold.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
