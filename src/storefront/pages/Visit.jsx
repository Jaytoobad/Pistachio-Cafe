import React from 'react';
import { CONTACT, HOURS, DAY_LABELS, formatClock } from '../config';
import Seo from '../components/Seo';

export default function Visit() {
  const days = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="visit-page">
      <Seo title="Visit | Pistachio Cafe" description="Location and hours for Pistachio Cafe in Spintex, Accra." />

      <section className="section">
        <div className="container">
          <p className="page-hero-eyebrow">Visit us</p>
          <h1 className="page-hero-title">Visit us</h1>
          <p className="page-hero-desc">{CONTACT.address}</p>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xl)' }}>Opening hours</h2>
            <ul className="list-nudge" style={{ display: 'grid', gap: 6, maxWidth: 420, listStyle: 'none', padding: 0, margin: 0 }}>
              {days.map((d) => {
                const h = d === 0 || d === 6 ? HOURS.weekend : HOURS.weekday;
                return (
                  <li key={d} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', padding: '6px 0' }}>
                    <span>{DAY_LABELS[d]}</span>
                    <span>{formatClock(h.open)} &ndash; {formatClock(h.close)}</span>
                  </li>
                );
              })}
            </ul>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Get directions</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
