import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useStoreStatus } from '../hooks/useStoreStatus';
import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP } from '../config';
import { HERO_HOURS_TEXT } from '../data/content';
import { CLOSE_SVG } from './icons';

const navLinks = [
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'Our story' },
  { to: '/visit', label: 'Visit' },
  { to: '/track', label: 'Track order' },
];

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function HamburgerDrawer({ open, onClose }) {
  const status = useStoreStatus();
  const [openNow, setOpenNow] = useState(status.startsWith('Open now'));
  const drawerRef = useRef(null);

  useEffect(() => {
    setOpenNow(status.startsWith('Open now'));
  }, [status]);

  useEffect(() => {
    if (!open) return undefined;

    const drawer = drawerRef.current;
    const trigger = document.activeElement;
    const first = drawer?.querySelector(FOCUSABLE);
    if (first) first.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = drawer?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="sf-drawer-overlay" onClick={onClose} />
      <div
        className="sf-hamburger-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <button type="button" className="sf-drawer-close" onClick={onClose} aria-label="Close menu">
          {CLOSE_SVG}
        </button>

        <nav className="sf-drawer-nav" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sf-drawer-link${isActive ? ' sf-drawer-link--active' : ''}`}
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sf-drawer-status">
          <span className={`sf-drawer-status-badge ${openNow ? 'sf-drawer-status-open' : 'sf-drawer-status-closed'}`}>
            {openNow ? 'Open now' : 'Closed'}
          </span>
          <span className="sf-drawer-status-hours">{HERO_HOURS_TEXT}</span>
        </div>

        <Link to="/menu" className="sf-drawer-order" onClick={onClose}>
          Order now
        </Link>

        <div className="sf-drawer-contacts">
          {BRAND.instagramUrl && (
            <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="sf-drawer-contact">
              Instagram
            </a>
          )}
          {HAS_WHATSAPP && CONTACT.whatsapp && (
            <a href={`https://wa.me/${CONTACT.whatsapp}`} className="sf-drawer-contact">
              WhatsApp
            </a>
          )}
          {HAS_PHONE && CONTACT.phone && (
            <a href={`tel:${CONTACT.phone}`} className="sf-drawer-contact">
              {CONTACT.phone}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
