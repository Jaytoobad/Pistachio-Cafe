import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../storefront.css';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE } from '../config';

function hoursString() {
  const d = new Date();
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const h = isWeekend ? HOURS.weekend : HOURS.weekday;
  return `${h.open} – ${h.close}`;
}

export default function StorefrontLayout({ children }) {
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
            {menuOpen ? '✕' : '☰'}
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
          <div className="sf-footer-top">
            <div className="sf-footer-brand-block">
              <div className="sf-footer-brand">{BRAND.name}</div>
              <span className="sf-footer-tag">{BRAND.tagline}</span>
            </div>
            <nav className="sf-footer-links" aria-label="Footer links">
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/track">Track an order</Link>
              <Link to="/contact">Contact</Link>
            </nav>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${BRAND.instagram}`}
              className="sf-footer-instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </a>
          </div>
          <div className="sf-footer-details">
            <div className="sf-footer-detail">
              <strong>Hours</strong>
              <span>
                Weekdays {HOURS.weekday.open} – {HOURS.weekday.close} · Weekends {HOURS.weekend.open} – {HOURS.weekend.close}
              </span>
            </div>
            <div className="sf-footer-detail">
              <strong>Address</strong>
              <span>{CONTACT.address}</span>
            </div>
            {HAS_PHONE && (
              <div className="sf-footer-detail">
                <strong>Phone</strong>
                <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
              </div>
            )}
          </div>
          <div className="sf-footer-bottom">
            <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
