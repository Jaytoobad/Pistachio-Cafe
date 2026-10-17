import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../storefront.css';
import { useCart } from '../context/CartContext';
import { subscribeNewsletter } from '../services/newsletter';
import { useToast } from '../../lib/context/ToastContext';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { BRAND, HOURS, CONTACT, IMAGES } from '../config';

function hoursString() {
  const d = new Date();
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const h = isWeekend ? HOURS.weekend : HOURS.weekday;
  return `${h.open} â€“ ${h.close}`;
}

export default function StorefrontLayout({ children }) {
  useDocumentTitle();
  const { count } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/contact', label: 'Contact' },
  ];

  async function handleNewsletter(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector('input')?.value?.trim();
    if (!email) return;
    try {
      const result = await subscribeNewsletter(email);
      form.reset();
      showToast(result.alreadySubscribed ? 'You are already subscribed.' : 'Welcome — check your inbox to confirm.');
    } catch (err) {
      showToast(err?.message || 'Could not subscribe. Try again.', 'error');
    }
  }

  return (
    <div className="sf-root">
      <a href="#main" className="sf-skip">Skip to content</a>

      {/* Slim ticker with real facts only */}
      <div className="sf-ticker" aria-hidden="true">
        <div className="sf-ticker-track">
          <span>Open {hoursString()}</span>
          <span>{BRAND.offerings.join(' · ')}</span>
          <span>{BRAND.location}</span>
          <span>Open {hoursString()}</span>
          <span>{BRAND.offerings.join(' · ')}</span>
          <span>{BRAND.location}</span>
        </div>
      </div>

      <header className="sf-header">
        <div className="sf-header-inner">
          <Link to="/" className="sf-brand" aria-label="Pistachio Café home">
            <img src={IMAGES.logo} alt="Pistachio Café" className="sf-brand-logo" onError={(e) => { e.target.onerror = null; e.target.src = IMAGES.logoPng; }} />
          </Link>

          <nav className="sf-nav" aria-label="Primary">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end !== false} className={({ isActive }) => isActive ? 'active' : ''}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="sf-cart-btn"
            aria-label="View cart"
            onClick={() => navigate('/cart')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className={`sf-cart-badge ${count === 0 ? 'hidden' : ''}`}>{count}</span>
          </button>

          <button
            className="sf-nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'âœ•' : 'â˜°'}
          </button>
        </div>

        {menuOpen && (
          <div className="sf-mobile-menu">
            <div className="sf-mobile-menu-inner">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end !== false}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="main" className="sf-main">
        {children}
      </main>

      <footer className="sf-footer" id="contact">
        <div className="sf-footer-inner">
          <div className="sf-footer-grid">
            <div>
              <div className="sf-footer-brand">{BRAND.name}</div>
              <span className="sf-footer-tag">{BRAND.tagline}</span>
              <p>{BRAND.offerings.join(' · ')}. {BRAND.location}.</p>
              <div className="sf-footer-social">
                <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${BRAND.instagram}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/menu">Menu</Link></li>
                <li><Link to="/cart">Your cart</Link></li>
                <li><Link to="/track">Track an order</Link></li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <ul>
                <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>
                <li>{CONTACT.address}</li>
                <li>Weekdays {HOURS.weekday.open} â€“ {HOURS.weekday.close}</li>
                <li>Weekends {HOURS.weekend.open} â€“ {HOURS.weekend.close}</li>
              </ul>
            </div>
            <div>
              <h4>Stay in the loop</h4>
              <p>New dishes first, straight to your inbox.</p>
              <form className="sf-newsletter-form" id="footer-newsletter-form" onSubmit={handleNewsletter}>
                <input type="email" id="footer-newsletter-email" placeholder="you@email.com" required aria-label="Newsletter email" />
                <button type="submit">Join</button>
              </form>
            </div>
          </div>
          <div className="sf-footer-bottom">
            <span>Â© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
            <span>Made with care, one plate at a time.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
