import { Link } from 'react-router-dom';
import { BRAND, CONTACT, HOURS } from '../config';
import { HERO_HOURS_TEXT } from '../data/content';
import { useStoreStatus } from '../hooks/useStoreStatus';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';

const MAP_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CLOCK_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export default function Visit() {
  useDocumentTitle('Visit | Pistachio Caf\u00e9');
  const status = useStoreStatus();
  const open = status.startsWith('Open now');

  return (
    <div className="container min-h-dvh py-6">
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-eyebrow text-muted">Come by</p>
          <h1 className="page-hero-title text-charcoal font-serif">Visit us</h1>
          <p className="page-hero-desc text-muted">
            We are in {BRAND.location}. Order ahead for pickup, or have it delivered anywhere we cover in Accra.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2-sm" style={{ gap: 'var(--space-5)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-ochre-dark)', marginBottom: 12 }}>
                {MAP_SVG}
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Where we are</h2>
              </div>
              <p style={{ margin: '0 0 6px', color: 'var(--color-text-muted)' }}>{CONTACT.address}</p>
              <p style={{ margin: '0 0 18px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                The exact street number is on your order confirmation.
              </p>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
                Get directions
              </a>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-ochre-dark)', marginBottom: 12 }}>
                {CLOCK_SVG}
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Opening hours</h2>
              </div>
              <p style={{ margin: '0 0 6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    marginRight: 8,
                    padding: '2px 10px',
                    borderRadius: '999px',
                    background: open ? '#EAF3EC' : '#F1ECE9',
                    color: open ? '#3D6A46' : '#6B5F5A',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {open ? 'Open now' : 'Closed now'}
                </span>
                {HERO_HOURS_TEXT}
              </p>
              <p style={{ margin: '0 0 18px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Weekdays {HOURS.weekday.open} to {HOURS.weekday.close}. Weekends {HOURS.weekend.open} to {HOURS.weekend.close}.
              </p>
              <Link to="/menu" className="btn btn-accent">
                Order now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>What happens when you arrive</h2>
            <p>Pick up orders are wrapped and handed over at the counter.</p>
          </div>
          <div className="grid grid-cols-3-md" style={{ gap: 'var(--space-5)' }}>
            <div className="value-card">
              <h3 className="text-charcoal">Order ahead</h3>
              <p className="text-muted">Place your order on the menu page and choose pickup. It is ready when you arrive.</p>
            </div>
            <div className="value-card">
              <h3 className="text-charcoal">Track it</h3>
              <p className="text-muted">Every order gets a code, so you can follow it from the kitchen to your table.</p>
            </div>
            <div className="value-card">
              <h3 className="text-charcoal">Stay a while</h3>
              <p className="text-muted">Weekend brunch runs late, so there is time to sit and let the food land.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
