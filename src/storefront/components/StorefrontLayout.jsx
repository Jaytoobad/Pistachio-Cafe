import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../styles/storefront.css';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { BRAND, HOURS, CONTACT, IMAGES, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL, HAS_FACEBOOK, HAS_X, HAS_TIKTOK } from '../config';

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
      if (close <= open) close = 24 * 60;

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
  { to: '/cart', label: 'Cart' },
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <a href="#main" className="skip-link">Skip to content</a>

      {/* Announcement ticker — infinite marquee, no mid-word truncation */}
      <div className="announcement-ticker" aria-hidden="true">
        <div className="announcement-track">
          <span>Fresh baked every morning</span>
          <span>Locally roasted coffee</span>
          <span>Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM</span>
          <span>Brunch served all weekend</span>
          <span>Fresh baked every morning</span>
          <span>Locally roasted coffee</span>
          <span>Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM</span>
          <span>Brunch served all weekend</span>
        </div>
      </div>

      {/* Sticky header with backdrop blur, vertically centered brand/cart/hamburger */}
      <header className="site-header navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand" aria-label="Pistachio Café home">
            <img
              src={IMAGES.logo}
              alt="Pistachio Café"
              style={{ height: '36px', width: 'auto' }}
              onError={(e) => { e.target.onerror = null; e.target.src = IMAGES.logoPng; }}
            />
          </Link>
          <ul className="nav-links" role="navigation" aria-label="Main">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLinkItem l={l} onClick={closeMenu} />
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <Link to="/cart" className="cart-link tap-target" aria-label="View cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span className="cart-badge" hidden={count === 0}>{count}</span>
            </Link>
            <button className="nav-toggle tap-target" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main id="main" style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="site-footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            <div>
              <img src={IMAGES.logo} alt="Pistachio Café" style={{ height: '32px', width: 'auto', marginBottom: '0.75rem' }} onError={(e) => { e.target.onerror = null; e.target.src = IMAGES.logoPng; }} />
              <p>Handmade breakfast, brunch, and desserts in {BRAND.location}. Open every day.</p>
              <div className="social-row">
                <a href={BRAND.instagramUrl} aria-label="Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
                {HAS_FACEBOOK && (
                  <a href={BRAND.facebookUrl} aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.5-3H13.5V8.3c0-.87.24-1.46 1.5-1.46H16.6V4.14C16.34 4.1 15.44 4 14.4 4c-2.17 0-3.66 1.32-3.66 3.75v2.75H8.2v3h2.54V21h2.76z"/></svg></a>
                )}
                {HAS_X && (
                  <a href={BRAND.xUrl} aria-label="X (Twitter)" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.6 8.7L23 21h-6.9l-5.4-6.6L4.5 21H1.4l8.1-9.3L1 3h7l4.9 6z"/></svg></a>
                )}
                {HAS_WHATSAPP && (
                  <a href={`https://wa.me/${CONTACT.whatsapp}`} aria-label="WhatsApp" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.7 14.2c-.24.7-1.4 1.3-2 1.4-.5.1-1.2.2-3.6-.75-3-1.2-4.9-4.2-5-4.4-.15-.2-1.2-1.6-1.2-3.1 0-1.4.75-2.1 1-2.4.25-.3.6-.35.8-.35h.55c.2 0 .45 0 .65.5.24.6.8 2 .87 2.15.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.2-.3.4-.45.5-.15.15-.3.3-.13.6.15.3.7 1.2 1.5 1.95 1.05 1 1.9 1.3 2.2 1.45.3.15.5.13.68-.08.2-.2.75-.85.95-1.15.2-.3.4-.25.65-.15 .25.1 1.6.75 1.9 .9 .3 .15 .5 .2 .55 .35 .07 .15 .07 .85-.17 1.55z"/></svg></a>
                )}
                {HAS_TIKTOK && (
                  <a href={BRAND.tiktokUrl} aria-label="TikTok" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3.1v13.4a2.6 2.6 0 1 1-2-2.53v-3.15A5.75 5.75 0 1 0 16.5 13V8.1a7.3 7 0 0 0 4 1.2V6.2a4.2 4.2 0 0 1-4-4.2z"/></svg></a>
                )}
              </div>
            </div>
            <div>
              <h4>Explore</h4>
              <ul className="footer-links">
                <li><Link to="/menu">Full menu</Link></li>
                <li><Link to="/about">Our story</Link></li>
                <li><Link to="/cart">Your cart</Link></li>
                <li><Link to="/track">Track an order</Link></li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <ul className="footer-links">
                <li>{CONTACT.address}</li>
                {HAS_PHONE && <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>}
                {HAS_WHATSAPP && <li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>}
                {HAS_EMAIL && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
                <li>Mon–Fri 8AM–11PM · Sat–Sun 8AM–12AM</li>
              </ul>
            </div>
            <div>
              <h4>Stay in the loop</h4>
              <p>New seasonal dishes, first — straight to your inbox.</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); }}>
                <input type="email" placeholder="you@email.com" required />
                <button type="submit">Join</button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Pistachio Café. All rights reserved.</span>
            <span>Made with care, one plate at a time.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
