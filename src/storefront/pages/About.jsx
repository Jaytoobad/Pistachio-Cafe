import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, IMAGES } from '../config';
import { ABOUT_HERO, ABOUT_STATS, ABOUT_FAQ_DELIVERY, ABOUT_STORY } from '../data/content';
import SafeImg from '../components/SafeImg';

export default function About() {
  return (
    <div className="container min-h-dvh py-6">
      <div>
        <section className="page-hero">
          <div className="container">
            <p className="page-hero-eyebrow text-muted">{ABOUT_HERO.eyebrow}</p>
            <h1 className="page-hero-title text-charcoal font-serif">{ABOUT_HERO.heading}</h1>
            <p className="page-hero-desc text-muted">{ABOUT_HERO.body}</p>
          </div>
        </section>

        {/* ============ OUR STORY (premium brand card) ============ */}
        <section className="section">
          <div className="container">
            <div className="story-card">
              <div className="aspect-16-9 overflow-hidden rounded-xl mb-4">
                <SafeImg
                  src={IMAGES.about}
                  label="Breakfast and coffee on the counter"
                  alt="Breakfast plates and coffee on the counter at Pistachio Cafe"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2>{ABOUT_STORY.title}</h2>
              <p className="text-muted leading-relaxed mb-4">{ABOUT_STORY.body}</p>
              <p className="text-muted leading-relaxed mb-4">{ABOUT_STORY.body2}</p>
              <Link to="/" className="btn btn-primary btn-cafe btn-cafe-primary">Order online</Link>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Good to know</h2>
                <p>The practical details, up front.</p>
              </div>
            </div>
            <div className="stat-strip">
              {ABOUT_STATS.map((s, i) => (
                <div key={i}>
                  <span className="stat-num text-charcoal">{s.value}</span>
                  <span className="stat-label text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ VALUES ============ */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>What we hold onto</h2>
                <p>The things that don't change as we grow.</p>
              </div>
            </div>
            <div className="value-grid">
              <div className="value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M12 21C7 17 3 13.5 3 9.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9 3.5c0 4-4 7.5-9 11.5z" />
                </svg>
                <h3 className="text-charcoal">Hospitality first</h3>
                <p className="text-muted">Every plate leaves the kitchen the way we'd want to receive it ourselves &mdash; warm, unhurried, and generous.</p>
              </div>
              <div className="value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <h3 className="text-charcoal">Made fresh, not fast</h3>
                <p className="text-muted">We'd rather you wait a few extra minutes than eat something that was made in advance and reheated.</p>
              </div>
              <div className="value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M3 3v18h18M18.4 8.4l-5 5-3-3-4 4" />
                </svg>
                <h3 className="text-charcoal">Honest sourcing</h3>
                <p className="text-muted">We cook in Spintex, and most of what leaves the pass is made in our own kitchen that morning.</p>
              </div>
              <div className="value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" />
                </svg>
                <h3 className="text-charcoal">A place for everyone</h3>
                <p className="text-muted">Solo laptop mornings, big family brunches, first dates &mdash; every table gets the same care.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="section-head">
              <div>
                <h2>A few common questions</h2>
              </div>
            </div>
            <details className="faq-item">
              <summary>Can I order for a large group?</summary>
              <p>Yes. Order as many plates as you need and add a note at checkout. For a table of six or more, message us on Instagram so we can plan the timing.</p>
            </details>
            <details className="faq-item">
              <summary>Can you accommodate allergies or dietary needs?</summary>
              <p>Most of the menu can be adapted. Add a note at checkout or let your server know, and our kitchen will take it from there.</p>
            </details>
            <details className="faq-item">
              <summary>Do you deliver outside {BRAND.location.split(',')[0]}?</summary>
              <p>{ABOUT_FAQ_DELIVERY}</p>
            </details>
            <details className="faq-item">
              <summary>How do I pay?</summary>
              <p>We take card and mobile money payments through Paystack at checkout, and the receipt lands on your phone as soon as the payment goes through.</p>
            </details>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="section text-center">
          <div className="container">
            <h2>Come see us, or order in</h2>
            <p style={{ margin: '0 auto 1.5rem', maxWidth: '48ch', color: 'var(--color-muted)' }}>Whichever way you'd rather have your morning, we've got you.</p>
            <div className="hero-cta gap-3" style={{ justifyContent: 'center' }}>
              <Link to="/menu" className="btn btn-accent btn-cafe btn-cafe-primary">Order online</Link>
              <Link to="/" className="btn btn-outline btn-cafe btn-cafe-outline" style={{ color: 'var(--color-charcoal)', borderColor: 'var(--color-charcoal)' }}>Get directions</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
