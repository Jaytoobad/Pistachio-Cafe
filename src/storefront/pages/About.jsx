import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config';
import { ABOUT_HERO, ABOUT_STATS, ABOUT_FAQ_DELIVERY } from '../data/content';
import '../old-static.css';

export default function About() {
  return (
    <div className="old-container">
      <main id="main">
        <section className="old-page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow">{ABOUT_HERO.eyebrow}</p>
            <h1>{ABOUT_HERO.heading}</h1>
            <p>{ABOUT_HERO.body}</p>
          </div>
        </section>

        <section className="old-section">
          <div className="old-container old-about-intro">
            <div>
              <h2>What we're working toward</h2>
              <p>We're not chasing being the biggest café in Accra — we're chasing being the one people trust with their mornings.</p>
              <ul className="old-goal-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                  <div>
                    <strong>Source honestly</strong>
                    <p>Work directly with local farms and roasters, and always know exactly where our ingredients come from.</p>
                  </div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <div>
                    <strong>Cut food waste in half</strong>
                    <p>Plan our daily bakes around real demand, and turn surplus into staff meals and community donations.</p>
                  </div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div>
                    <strong>Grow our own team</strong>
                    <p>Train from within — most of our senior kitchen staff started as apprentices in this very building.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="old-about-intro-media">
              <img
                src="images/about-team.jpg"
                alt="The Pistachio kitchen team"
                loading="lazy"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    const span = document.createElement('span');
                    span.textContent = 'Add photo: images/about-team.jpg';
                    span.style.fontSize = '0.8rem';
                    span.style.color = '#8b8570';
                    span.style.padding = '1rem';
                    span.style.textAlign = 'center';
                    e.currentTarget.replaceWith(span);
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section className="old-section old-section-alt">
          <div className="old-container">
            <div className="old-section-head">
              <div>
                <h2>Where we've gotten to so far</h2>
                <p>A few numbers we're proud of.</p>
              </div>
            </div>
            <div className="old-stat-strip">
              {ABOUT_STATS.map((s, i) => (
                <div key={i}>
                  <span className="old-stat-num">{s.value}</span>
                  <span className="old-stat-label">{s.label}</span>
                  {/* PLACEHOLDER: replace with real info — this stat is invented. */}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="old-section">
          <div className="old-container">
            <div className="old-section-head">
              <div>
                <h2>What we hold onto</h2>
                <p>The things that don't change as we grow.</p>
              </div>
            </div>
            <div className="old-value-grid">
              <div className="old-value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 21C7 17 3 13.5 3 9.5A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9 3.5c0 4-4 7.5-9 11.5z" />
                </svg>
                <h3>Hospitality first</h3>
                <p>Every plate leaves the kitchen the way we'd want to receive it ourselves — warm, unhurried, and generous.</p>
              </div>
              <div className="old-value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <h3>Made fresh, not fast</h3>
                <p>We'd rather you wait a few extra minutes than eat something that was made in advance and reheated.</p>
              </div>
              <div className="old-value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M3 3v18h18M18.4 8.4l-5 5-3-3-4 4" />
                </svg>
                <h3>Honest sourcing</h3>
                <p>We name the farms our produce comes from, because you deserve to know what you're eating and who made it.</p>
              </div>
              <div className="old-value-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 2 3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" />
                </svg>
                <h3>A place for everyone</h3>
                <p>Solo laptop mornings, big family brunches, first dates — every table gets the same care.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="old-section old-section-alt">
          <div className="old-container" style={{ maxWidth: 760 }}>
            <div className="old-section-head">
              <div>
                <h2>A few common questions</h2>
              </div>
            </div>
            <details className="old-faq-item" open>
              <summary>Do you take reservations?</summary>
              <p>We hold a handful of tables for walk-ins every day, but for groups of 5 or more we recommend calling ahead so we can seat you comfortably.</p>
            </details>
            <details className="old-faq-item">
              <summary>Can you accommodate allergies or dietary needs?</summary>
              <p>Yes — most of our menu can be adapted. Add a note at checkout or let your server know, and our kitchen will take it from there.</p>
            </details>
            <details className="old-faq-item">
              <summary>Do you deliver outside {BRAND.location.split(',')[0]}?</summary>
              <p>{ABOUT_FAQ_DELIVERY}</p>
            </details>
            <details className="old-faq-item">
              <summary>Is parking available?</summary>
              <p>There's free parking directly behind the building, with space for about 15 cars.</p>
            </details>
          </div>
        </section>

        <section className="old-section old-text-center">
          <div className="old-container">
            <h2>Come see us, or order in</h2>
            <p style={{ margin: '0 auto 1.5rem' }}>Whichever way you'd rather have your morning, we've got you.</p>
            <div className="old-hero-cta" style={{ justifyContent: 'center' }}>
              <Link to="/menu" className="old-btn old-btn-accent">Order online</Link>
              <Link to="/" className="old-btn old-btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>Get directions</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}