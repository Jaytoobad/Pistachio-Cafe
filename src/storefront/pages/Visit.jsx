import React from 'react';
import { CONTACT, HOURS, DAY_LABELS, formatClock } from '../config';
import Seo from '../components/Seo';
import SplitView from '../components/SplitView';
import PlaceholderImage from '../components/PlaceholderImage';

export default function Visit() {
  const days = [1,2,3,4,5,6,0];
  return (
    <div className="visit-page" style={{ minHeight: '100dvh' }}>
      <Seo title="Visit | Pistachio Cafe" description="Location and hours for Pistachio Cafe in Spintex, Accra." />

      {/* Split view: cafe interior left, visit info right (desktop); stacked on mobile */}
      <SplitView
        imageSrc="/images/about-marble-bag.jpg"
        imageAlt="Coffee and pastry at Pistachio Cafe"
        imageCaption="Come sit with us \u2014 Spintex, Accra"
      >
        <div>
          <section className="sf-section">
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Visit us</h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 'var(--text-lg)' }}>{CONTACT.address}</p>
          </section>

          <section className="sf-section" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Opening hours</h2>
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
            <div style={{ marginTop: '1.25rem' }}>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary link-nudge">Get directions</a>
            </div>
          </section>
        </div>
      </SplitView>
    </div>
  );
}
