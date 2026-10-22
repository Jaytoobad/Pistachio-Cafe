import React from 'react';
import { CONTACT, HOURS, DAY_LABELS, formatClock } from '../config';
import Seo from '../components/Seo';

export default function Visit() {
  const days = [1,2,3,4,5,6,0];
  return (
    <div className="sf-container" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Seo title="Visit | Pistachio Cafe" description="Location and hours for Pistachio Cafe in Spintex, Accra." />
      <section className="sf-section">
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Visit us</h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{CONTACT.address}</p>
      </section>
      <section className="sf-section" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Opening hours</h2>
        <div style={{ display: 'grid', gap: 6, maxWidth: 420 }}>
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
        <div style={{ marginTop: '1.25rem' }}>
          <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Get directions</a>
        </div>
      </section>
    </div>
  );
}
