import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../storefront.css';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE } from '../config';

const HEADER_BREAKPOINT = 1024;

// --- Live open/closed status from HOURS, in Africa/Accra time ----------------

function useStoreStatus() {
  const [status, setStatus] = useState('Closed · opens 08:00');

  useEffect(() => {
    const compute = () => {
      const accra = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' }));
      const isWeekend = accra.getDay() === 0 || accra.getDay() === 6;
      const h = isWeekend ? HOURS.weekend : HOURS.weekday;

      const [oh, om] = h.open.split(':').map(Number);
      const [ch, cm] = h.close.split(':').map(Number);
      const now = accra.getHours() * 60 + accra.getMinutes();
      const open = oh * 60 + om;
      let close = ch * 60 + cm;
      if (close <= open) close = 24 * 60; // e.g. weekend close at midnight rolls to next day

      const openNow = now >= open && now < close;
      const closeLabel = ch === 0 && cm === 0 ? 'midnight' : h.close;
      setStatus(openNow ? `Open now · closes ${closeLabel}` : `Closed · opens ${h.open}`);
    };

    compute();
    const timer = setInterval(compute, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return status;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/track', label: 'Track order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const DELIVERY_LINE = 'Delivery across Spintex & Accra';

function NavLinkItem({ l, onClick }) {
  return (
    <NavLink
      key={l.to}
      to={l.to}
      end={l.end !== false}
      className={({ isActive }) => (isActive ? 'active' : '')}
      onClick={onClick}
    >
      {l.label}
    </NavLink>
  );
}

export default function StorefrontLayout({ children }) {
  const { count } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const status = useStoreStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="sf-root">
      <a href="#main" className="sf-skip">Skip to content</a>

      {/* Top ticker: static line on desktop, seamless marquee on mobile */}
      <div className="sf-ticker" aria-hidden="true">
        <span className={`sf-ticker-static ${status.open ? 'sf-ticker--open' : ''}`}>{status}</span>
        <span className="sf-ticker-static sf-ticker-dot" aria-hidden="true">
          ·
        </span>
        <span className="sf-ticker-static">{DELIVERY_LINE}</span>
        <div className="sf-ticker-marquee">
          <div className="sf-ticker-track">
            <span>{status}</span>
            <span>·</span>
            <span>{DELIVERY_LINE}</span>
            <span>{status}</span>
            <span>·</span>
            <span>{DELIVERY_LINE}</span>
            <span>{status}</span>
            <span>·</span>
            <span>{DELIVERY_LINE}</span>
            <span>{status}</span>
            <span>·</span>
            <span>{DELIVERY_LINE}</span>
          </div>
        </div>
      </div>

      <header className={`sf-header ${scrolled ? 'sf-header--scrolled' : ''}`}>
        <div className="sf-header-inner">
          <Link to="/" className="sf-brand" aria-label="Pistachio Café home">
            <img
              src={IMAGES.logo}
              alt=""
              className="sf-brand-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = IMAGES.logoPng;
              }}
            />
            <span className="sf-brand-tag">{BRAND.tagline}</span>
          </Link>

          <div className="sf-header-center">
            <nav className="sf-nav" aria-label="Primary">
              {navLinks.map((l) => (
                <NavLinkItem key={l.to} l={l} />
              ))}
            </nav>
          </div>

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
          <div className={`sf-mobile-menu ${menuOpen ? 'open' : ''}`}>
            <button className="sf-drawer-close" aria-label="Close menu" onClick={closeMenu}>
              ✕
            </button>
            <nav className="sf-drawer-nav" aria-label="Primary">
              {navLinks.map((l) => (
                <NavLinkItem key={l.to} l={l} onClick={closeMenu} />
              ))}
            </nav>
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
