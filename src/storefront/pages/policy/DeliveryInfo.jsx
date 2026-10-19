import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP, DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE, getContact } from '../../config';
import { DELIVERY_ZONES_TEXT } from '../../data/content';

export default function DeliveryInfo() {
  return (
    <div className="sf-container">
      <section className="sf-section">
        <p className="sf-hero-eyebrow">Delivery info</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>How delivery works</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 14, maxWidth: '56ch' }}>
          Everything you need to know about getting your order from {BRAND.name} to your door.
        </p>
      </section>

      <section className="sf-section" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Delivery zones</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {DELIVERY_ZONES_TEXT}
            </p>
            <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Zones and fees: {DELIVERY_ZONES.map((z) => `${z.name} ${CONTACT.currencySymbol || '₵'}${z.fee}`).join(', ')}. Default zone is {DEFAULT_DELIVERY_ZONE.name}.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Estimated time</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Orders typically arrive within 45–75 minutes during opening hours. You will get a live status
              update when your rider is on the way.
            </p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>Minimum order</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              There is no minimum for pickup. Delivery minimums, where they apply, are shown at checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="sf-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Contact</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            {HAS_PHONE && `Phone: ${CONTACT.phone}`}<br />
            {HAS_WHATSAPP && `WhatsApp: ${CONTACT.whatsapp}`}<br />
            Address: {CONTACT.address}
          </p>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Contact details are pending owner confirmation.
          </p>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <h3 style={{ margin: '0 0 8px' }}>Need help?</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            If your order is late or you have a special request, call or message us on WhatsApp and we will sort it out.
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {HAS_PHONE && <a href={`tel:${CONTACT.phone}`} className="sf-btn sf-btn-primary">Call us</a>}
            {HAS_WHATSAPP && <a href={`https://wa.me/${CONTACT.whatsapp}`} className="sf-btn sf-btn-ghost" target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/menu" className="sf-btn sf-btn-primary">Order now</Link>
        <Link to="/contact" className="sf-btn sf-btn-ghost">Contact page</Link>
      </div>
    </div>
  );
}