import React from 'react';
import { CONTACT, HOURS, DAY_LABELS, formatClock } from '../../config';
import Seo from '../../components/Seo';

export default function DeliveryInfo() {
  const days = [1,2,3,4,5,6,0];
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Seo title="Delivery info | Pistachio Cafe" description="Delivery zones, fees and opening hours." />
      <section className="sf-section">
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Delivery info</h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          We offer pickup in store and delivery across parts of Accra, focused on Spintex.
        </p>
      </section>

      <section className="sf-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gap: 24 }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Hours</h2>
            <div style={{ display: 'grid', gap: 6 }}>
              {days.map((d) => {
                const h = d === 0 || d === 6 ? HOURS.weekend : HOURS.weekday;
                return (
                  <div key={d} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>{DAY_LABELS[d]}</span>
                    <span>{formatClock(h.open)} &ndash; {formatClock(h.close)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Location</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{CONTACT.address}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
