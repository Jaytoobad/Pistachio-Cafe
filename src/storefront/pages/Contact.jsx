import React from 'react';
import { BRAND, HOURS, CONTACT } from '../config';

export default function Contact() {
  return (
    <div className="sf-container">
      <section className="sf-section">
        <p className="sf-hero-eyebrow">Get in touch</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Contact us</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 14, maxWidth: '48ch' }}>
          Reach out with questions about orders, events, or anything else. We are in {BRAND.location} and happy to help.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20px, marginBottom: 32 }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Phone</h3>
          <a href={`tel:${CONTACT.phone}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.phone}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>TODO: confirm this number with the owner.</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>WhatsApp</h3>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
            Message us on WhatsApp
          </a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>TODO: confirm this WhatsApp number with the owner.</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Email</h3>
          <a href={`mailto:${CONTACT.email}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{CONTACT.email}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>TODO: confirm this email with the owner.</p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Instagram</h3>
          <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>{BRAND.instagram}</a>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Follow us for daily updates.</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Opening hours</h3>
        <p style={{ margin: 0 }}>Weekdays: <strong>{HOURS.weekday.open} – {HOURS.weekday.close}</strong></p>
        <p style={{ margin: '4px 0 0' }}>Weekends: <strong>{HOURS.weekend.open} – {HOURS.weekend.close}</strong></p>
        <p style={{ margin: '12px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Location: {BRAND.location}. TODO: confirm the exact street address with the owner.
        </p>
      </div>
    </div>
  );
}