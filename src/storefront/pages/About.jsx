import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, HOURS, CONTACT, IMAGES } from '../config';
import { formatMoney } from '../../lib/format';
import { useSettings } from '../context/SettingsContext';

export default function About() {
  const { settings } = useSettings();
  const deliveryFee = Number(settings?.delivery_fee || 0);

  return (
    <div className="sf-container">
      <section className="sf-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <p className="sf-hero-eyebrow">About us</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>A café in Spintex, Accra</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
              Pistachio Café serves {BRAND.offerings.join(', ').toLowerCase()} in the heart of {BRAND.location}.
              Our tagline says it all: <strong>{BRAND.tagline}</strong>.
            </p>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 14 }}>
              We open early and stay late, so you can drop by for coffee before work, linger over
              dessert after dinner, or unwind with shisha in the evening. Order online for pickup,
              or get it delivered to your door.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/menu" className="sf-btn sf-btn-primary">See the menu</Link>
              <Link to="/track" className="sf-btn sf-btn-ghost">Track an order</Link>
            </div>
          </div>
          <div style={{ aspectRatio: '4 / 3', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={IMAGES.about} alt="Inside Pistachio Café" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
          </div>
        </div>
      </section>

      <section className="sf-section">
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: 20 }}>What we offer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { title: 'Coffee', desc: 'Slow-brewed and carefully poured.' },
            { title: 'Desserts', desc: 'Handmade every morning.' },
            { title: 'Shisha', desc: 'Relax and unwind after hours.' },
            { title: 'Events', desc: 'Ask about hosting your gathering with us.' },
          ].map((item) => (
            <div key={item.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>{item.title}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sf-section" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '32px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Opening hours</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Weekdays <strong>{HOURS.weekday.open} – {HOURS.weekday.close}</strong></p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>Weekends <strong>{HOURS.weekend.open} – {HOURS.weekend.close}</strong></p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Location</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{BRAND.location}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>TODO: exact street address pending owner confirmation.</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>Order online</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Pickup is free. Delivery is {deliveryFee > 0 ? formatMoney(deliveryFee) : 'free'}.
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              TODO: confirm delivery fee with owner if it differs from settings.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/menu" className="sf-btn sf-btn-primary">Order now</Link>
          <a href={`tel:${CONTACT.phone}`} className="sf-btn sf-btn-ghost">Call us</a>
        </div>
      </section>
    </div>
  );
}