import React from 'react';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { BRAND, HOURS, CONTACT, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL } from '../config';
import { CONTACT_INTRO, CONTACT_EMAIL_PLACEHOLDER_NOTE } from '../data/content';

export default function Contact() {
  useDocumentTitle('Contact | Pistachio Café');
  return (
    <div className="sf-container min-h-dvh px-4 py-6">
      <section className="sf-section">
        <p className="sf-hero-eyebrow">Get in touch</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Contact us</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 14, maxWidth: '48ch' }}>
          {CONTACT_INTRO}
        </p>
      </section>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: 32 }}>
        {HAS_PHONE && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Phone</h3>
          <a href={`tel:${CONTACT.phone}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.phone}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>PLACEHOLDER: replace with real info — confirm this number with the owner.</p>
        </div>
        )}
        {HAS_WHATSAPP && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>WhatsApp</h3>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
            Message us on WhatsApp
          </a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>PLACEHOLDER: replace with real info — confirm this WhatsApp number with the owner.</p>
        </div>
        )}
        {/* PLACEHOLDER: email is hidden until a real address is set in
            config.CONTACT — `hello@pistachio.cafe` is a placeholder. */}
        {HAS_EMAIL && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Email</h3>
          <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.email}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{CONTACT_EMAIL_PLACEHOLDER_NOTE}</p>
        </div>
        )}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Instagram</h3>
          <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{BRAND.instagram}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Follow us for daily updates.</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Map</h3>
          <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
            Open in Google Maps
          </a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
            {CONTACT.address}
          </p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Opening hours</h3>
        <p style={{ margin: 0 }}>Weekdays: <strong>{HOURS.weekday.open} – {HOURS.weekday.close}</strong></p>
        <p style={{ margin: '4px 0 0' }}>Weekends: <strong>{HOURS.weekend.open} – {HOURS.weekend.close}</strong></p>
        <p style={{ margin: '12px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Location: {BRAND.location}. PLACEHOLDER: replace with real info — confirm the exact street address with the owner.
        </p>
      </div>
    </div>
  );
}