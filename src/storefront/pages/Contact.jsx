import React from 'react';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { BRAND, HOURS, CONTACT, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL } from '../config';
import { CONTACT_INTRO } from '../data/content';

export default function Contact() {
  useDocumentTitle('Contact | Pistachio Caf\u00e9');
  return (
    <div className="contact-page">
      <section className="section">
        <div className="container">
          <p className="page-hero-eyebrow">Get in touch</p>
          <h1 className="page-hero-title">Contact us</h1>
          <p className="page-hero-desc">{CONTACT_INTRO}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: 'var(--space-8)', marginBottom: 32 }}>
            {HAS_PHONE && (
              <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
                <h3 style={{ margin: '0 0 8px' }}>Phone</h3>
                <a href={`tel:${CONTACT.phone}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.phone}</a>
              </div>
            )}
            {HAS_WHATSAPP && (
              <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
                <h3 style={{ margin: '0 0 8px' }}>WhatsApp</h3>
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>Message us on WhatsApp</a>
                <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Chat with us directly.</p>
              </div>
            )}
            {HAS_EMAIL && (
              <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
                <h3 style={{ margin: '0 0 8px' }}>Email</h3>
                <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.email}</a>
              </div>
            )}
            <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
              <h3 style={{ margin: '0 0 8px' }}>Instagram</h3>
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{BRAND.instagram}</a>
              <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Follow us for daily updates.</p>
            </div>
          </div>

          <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 8px' }}>Map</h3>
            <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>Open in Google Maps</a>
            <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{CONTACT.address}</p>
          </div>

          <div className="card-lift" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px' }}>Opening hours</h3>
            <ul className="list-nudge" style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--color-text-muted)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>Weekdays</span>
                <strong>{HOURS.weekday.open} &ndash; {HOURS.weekday.close}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span>Weekends</span>
                <strong>{HOURS.weekend.open} &ndash; {HOURS.weekend.close}</strong>
              </li>
            </ul>
            <p style={{ margin: '12px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Location: {CONTACT.address}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
