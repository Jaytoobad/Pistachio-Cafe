import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config';
import { ABOUT_HERO, ABOUT_STATS, ABOUT_FAQ_DELIVERY } from '../data/content';
import '../../styles/storefront.css';

export default function About() {
  return (
    <div className="old-container min-h-dvh px-4 py-6">
      <main id="main">
        <section className="old-page-hero page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow page-hero-eyebrow text-muted">{ABOUT_HERO.eyebrow}</p>
            <h1 className="page-hero-title text-charcoal font-serif">{ABOUT_HERO.heading}</h1>
            <p className="page-hero-desc text-muted">{ABOUT_HERO.body}</p>
          </div>
        </section>

        {/* ============ OUR STORY (premium brand card) ============ */}
        <section className="old-section py-6">
          <div className="old-container px-4">
            <div className="story-card">
              <div className="aspect-16-9 overflow-hidden rounded-xl mb-4" style={{ background: '#EFE8D6' }}>
                <img
                  src="images/about-team.jpg"
                  alt="The Pistachio kitchen team"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const container = e.currentTarget.closest('.aspect-16-9');
                    if (container) {
                      container.innerHTML = '';
                      container.style.display = 'flex';
                      container.style.alignItems = 'center';
                      container.style.justifyContent = 'center';
                      const span = document.createElement('span');
                      span.className = 'dish-placeholder';
                      span.innerHTML = '<span style="font-size:1.5rem; line-height:1; display:block; margin-bottom:0.25rem;">🍽️</span>Team photo coming soon';
                      container.appendChild(span);
                    }
                  }}
                />
              </div>
              <h2>A neighbourhood table, done with care</h2>
              <p className="text-muted leading-relaxed mb-4">Pistachio started as a single espresso cart and grew into a full kitchen — but the goal never changed: make people feel properly looked after over a good plate of food.</p>
              <p className="text-muted leading-relaxed mb-4">We bake daily, source from growers we know by name, and treat every table — regulars and first-timers alike — like they're the reason we opened the doors.</p>
              <Link to="/" className="old-btn old-btn-primary btn-cafe btn-cafe-primary">Order online</Link>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="old-section old-section-alt py-6">
          <div className="old-container px-4">
            <div className="old-section-head">
              <div>
                <h2>Where we've gotten to so far</h2>
                <p>A few numbers we're proud of.</p>
              </div>
            </div>
            <div className="old-stat-strip stat-strip">
              {ABOUT_STATS.map((s, i) => (
                <div key={i}>
                  <span className="old-stat-num stat-num text-charcoal">{s.value}</span>
                  <span className="old-stat-label stat-label text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ VALUES ============ */}
        <section className="old-section py-6">
          <div className="old-container px-4">
            <div className="old-section-head">
              <div>
                <h2>What we hold onto</h2>
                <p>The things that don't change as we grow.</p>
              </div>
            </div>
            <div className="old-value-grid value-grid">
              <div className="old-value-card value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M12 21C7 17 3 13.5 3 9.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9 3.5c0 4-4 7.5-9 11.5z" />
                </svg>
                <h3 className="text-charcoal">Hospitality first</h3>
                <p className="text-muted">Every plate leaves the kitchen the way we'd want to receive it ourselves — warm, unhurried, and generous.</p>
              </div>
              <div className="old-value-card value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <h3 className="text-charcoal">Made fresh, not fast</h3>
                <p className="text-muted">We'd rather you wait a few extra minutes than eat something that was made in advance and reheated.</p>
              </div>
              <div className="old-value-card value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M3 3v18h18M18.4 8.4l-5 5-3-3-4 4" />
                </svg>
                <h3 className="text-charcoal">Honest sourcing</h3>
                <p className="text-muted">We name the farms our produce comes from, because you deserve to know what you're eating and who made it.</p>
              </div>
              <div className="old-value-card value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ color: '#D97706' }}>
                  <path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" />
                </svg>
                <h3 className="text-charcoal">A place for everyone</h3>
                <p className="text-muted">Solo laptop mornings, big family brunches, first dates — every table gets the same care.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="old-section old-section-alt py-6">
          <div className="old-container px-4" style={{ maxWidth: 760 }}>
            <div className="old-section-head">
              <div>
                <h2>A few common questions</h2>
              </div>
            </div>
            <details className="old-faq-item faq-item">
              <summary>Do you take reservations?</summary>
              <p>We hold a handful of tables for walk-ins every day, but for groups of 5 or more we recommend calling ahead so we can seat you comfortably.</p>
            </details>
            <details className="old-faq-item faq-item">
              <summary>Can you accommodate allergies or dietary needs?</summary>
              <p>Yes — most of our menu can be adapted. Add a note at checkout or let your server know, and our kitchen will take it from there.</p>
            </details>
            <details className="old-faq-item faq-item">
              <summary>Do you deliver outside {BRAND.location.split(',')[0]}?</summary>
              <p>{ABOUT_FAQ_DELIVERY}</p>
            </details>
            <details className="old-faq-item faq-item">
              <summary>Is parking available?</summary>
              <p>There's free parking directly behind the building, with space for about 15 cars.</p>
            </details>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="old-section old-text-center py-6">
          <div className="old-container px-4">
            <h2>Come see us, or order in</h2>
            <p style={{ margin: '0 auto 1.5rem', maxWidth: '48ch', color: 'var(--color-muted)' }}>Whichever way you'd rather have your morning, we've got you.</p>
            <div className="old-hero-cta hero-cta gap-3" style={{ justifyContent: 'center' }}>
              <Link to="/menu" className="old-btn old-btn-accent btn-cafe btn-cafe-primary">Order online</Link>
              <Link to="/" className="old-btn old-btn-outline btn-cafe btn-cafe-outline" style={{ color: 'var(--color-charcoal)', borderColor: 'var(--color-charcoal)' }}>Get directions</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
