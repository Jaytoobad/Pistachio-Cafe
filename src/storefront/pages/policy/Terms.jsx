// Draft
import React from 'react';
import { BRAND } from '../../config';
import Seo from '../../components/Seo';

export default function Terms() {
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Seo title="Terms | Pistachio Cafe" description="Terms of service for ordering at Pistachio Cafe." />
      <section className="sf-section">
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Terms of service</h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          These terms cover ordering, payment, delivery and cancellation at {BRAND.name}. By placing an order you agree to them.
        </p>
      </section>

      <section className="sf-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Ordering</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Prices are shown in Ghana cedis (GHS). Items are subject to availability.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Payment</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Payment is taken at checkout through Paystack. We do not store card details.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Delivery</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Delivery times are estimates. We are not liable for delays caused by traffic, weather or incorrect addresses.
            </p>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Cancellation</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              If you need to cancel, contact us as soon as possible. Cancellations may not be possible once preparation has started.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
