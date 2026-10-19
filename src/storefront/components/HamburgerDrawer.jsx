import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP } from '../config';
import { CLOSE_SVG } from './SiteHeader';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/track', label: 'Track order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function HamburgerDrawer({ open, onClose, cartCount = 0, favCount = 0 }) {
  const navigate = useNavigate();
  const status = useStoreStatus();
  const [openNow, setOpenNow] = useState(status.startsWith('Open now'));
  const drawerRef = useRef(null);

  useEffect(() => {
    setOpenNow(status.startsWith('Open now'));
  }, [status]);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable && focusable[0];
    if (first) first.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = drawer?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!els?.length) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hoursText = 'Mon\u2013Fri 8AM\u201311PM \u00b7 Sat\u2013Sun 8AM\u201312AM';

  return (
    <>
      <div className="sf-drawer-overlay" onClick={onClose} />
      <div className="sf-hamburger-drawer" ref={drawerRef}>
        <button type="button" className="sf-drawer-close" onClick={onClose} aria-label="Close menu">
          {CLOSE_SVG}
        </button>
        <nav className="sf-drawer-nav" aria-label="Main navigation">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `sf-drawer-link${isActive ? ' sf-drawer-link--active' : ''}`}
              onClick={onClose}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sf-drawer-actions">
          <button type="button" className="sf-drawer-action" onClick={() => { onClose(); navigate('/cart'); }}>
            Cart {cartCount > 0 && <span className="sf-drawer-action-badge">{cartCount}</span>}
          </button>
          <button type="button" className="sf-drawer-action" onClick={() => { onClose(); navigate('/menu'); }}>
            Search
          </button>
          <button type="button" className="sf-drawer-action" onClick={() => { onClose(); navigate('/menu'); }}>
            Favourites {favCount > 0 && <span className="sf-drawer-action-badge">{favCount}</span>}
          </button>
        </div>
        <div className="sf-drawer-status">
          <span className={`sf-drawer-status-badge ${openNow ? 'sf-drawer-status-open' : 'sf-drawer-status-closed'}`}>
            {openNow ? 'Open now' : 'Closed'}
          </span>
          <span className="sf-drawer-status-hours">{hoursText}</span>
        </div>
        <div className="sf-drawer-contacts">
          <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="sf-drawer-contact">
            Instagram
          </a>
          {HAS_WHATSAPP && (
            <a href={`https://wa.me/${CONTACT.whatsapp}`} className="sf-drawer-contact">
              WhatsApp
            </a>
          )}
          {HAS_PHONE && (
            <a href={`tel:${CONTACT.phone}`} className="sf-drawer-contact">
              {CONTACT.phone}
            </a>
          )}
        </div>
        <button type="button" className="sf-drawer-track" onClick={() => { onClose(); navigate('/track'); }}>
          Track your order
        </button>
      </div>
    </>
  );
}
