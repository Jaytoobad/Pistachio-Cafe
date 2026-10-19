import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/track', label: 'Track order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const HAMBURGER_SVG = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" y1="7" x2="18" y2="7" />
    <line x1="4" y1="11" x2="18" y2="11" />
    <line x1="4" y1="15" x2="18" y2="15" />
  </svg>
);

const CLOSE_SVG = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m16 6-10 10" />
    <path d="m6 6 10 10" />
  </svg>
);

const SEARCH_SVG = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m17 17-3-3" />
  </svg>
);

const HEART_SVG = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18.5 4.5c-1.2-1.2-3-1.2-4.2 0L12 6.8l-2.3-2.3c-1.2-1.2-3-1.2-4.2 0-1.2 1.2-1.2 3 0 4.2l4.5 4.5 4.5-4.5c1.2-1.2 1.2-3 0-4.2" />
  </svg>
);

export { CLOSE_SVG, HEART_SVG };

const BAG_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2l-3 4v12c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2h-3" />
    <path d="M3 6h18v12c0 1.1-0.9 2-2 2H5c-1.1 0-2-0.9-2-2z" />
  </svg>
);

export default function SiteHeader({
  menuOpen,
  scrolled,
  onToggleMenu,
  onToggleSearch,
  onToggleFavourites,
  onToggleCart,
  cartCount,
  favCount,
}) {
  const location = useLocation();

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="site-header-inner">
        <div className="site-header-start">
          <button
            type="button"
            className="site-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            {HAMBURGER_SVG}
            <span className="sr-only">Menu</span>
          </button>
          <Link to="/" className="site-brand" aria-label="Pistachio Café home">
            <SafeImg src={IMAGES.logo} label="Pistachio Café" alt="Pistachio Café" className="site-brand-logo" />
          </Link>
        </div>
        <nav className="site-header-nav" role="navigation" aria-label="Main">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `site-nav-link${isActive ? ' site-nav-link--active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-header-actions">
          <button type="button" className="site-icon-btn" aria-label="Search" onClick={onToggleSearch}>
            {SEARCH_SVG}
          </button>
          <button type="button" className="site-icon-btn" aria-label="Favourites" onClick={onToggleFavourites}>
            {HEART_SVG}
            {favCount > 0 && <span className="site-badge">{favCount}</span>}
          </button>
          <button type="button" className="site-icon-btn" aria-label={`View cart (${cartCount} items)`} onClick={onToggleCart}>
            {BAG_SVG}
            {cartCount > 0 && <span className="site-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
