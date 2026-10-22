import { Link, NavLink } from 'react-router-dom';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';

const navLinks = [
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'Our story' },
  { to: '/visit', label: 'Visit' },
  { to: '/track', label: 'Track order' },
];

const HAMBURGER_SVG = (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" y1="7" x2="18" y2="7" />
    <line x1="4" y1="11" x2="18" y2="11" />
    <line x1="4" y1="15" x2="18" y2="15" />
  </svg>
);

const BAG_SVG = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2l-3 4v12c0 1.1 0.9 2 2 2h14c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2h-3" />
    <path d="M3 6h18v12c0 1.1-0.9 2-2 2H5c-1.1 0-2-0.9-2-2z" />
  </svg>
);

export default function SiteHeader({ menuOpen, onToggleMenu, onToggleCart, cartCount }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-start">
          <Link to="/" className="site-brand" aria-label="Pistachio Caf&eacute; home">
            <SafeImg
              src={IMAGES.logo}
              label="Pistachio Caf&eacute;"
              alt="Pistachio Caf&eacute;"
              className="site-brand-logo"
            />
          </Link>
        </div>

        <nav className="site-header-nav" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav-link${isActive ? ' site-nav-link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header-actions">
          <Link to="/menu" className="site-order-btn">
            Order now
          </Link>

          <button
            type="button"
            className="site-icon-btn"
            aria-label={`Open cart (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
            onClick={onToggleCart}
          >
            {BAG_SVG}
            {cartCount > 0 && <span className="site-badge">{cartCount}</span>}
          </button>

          <button
            type="button"
            className="site-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            {HAMBURGER_SVG}
          </button>
        </div>
      </div>
    </header>
  );
}
