import { useLocation } from 'react-router-dom';
import { CONTACT, HAS_WHATSAPP } from '../config';

export default function FloatingWhatsapp() {
  const { pathname } = useLocation();

  if (!HAS_WHATSAPP) return null;

  const lifted = pathname === '/menu' || pathname === '/checkout';
  const text = "Hi%20Pistachio,%20I'd%20like%20to%20order";

  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`sf-whatsapp-fab${lifted ? ' sf-whatsapp-fab--lifted' : ''}`}
      aria-label="Order on WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.7 14.2c-.24.7-1.4 1.3-2 1.4-.5.1-1.2.2-3.6-.75-3-1.2-4.9-4.2-5-4.4-.15-.2-1.2-1.6-1.2-3.1 0-1.4.75-2.1 1-2.4.25-.3.6-.35.8-.35h.55c.2 0 .45 0 .65.5.24.6.8 2 .87 2.15.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.2-.3.4-.45.5-.15.15-.3.3-.13.6.15.3.7 1.2 1.5 1.95 1.05 1 1.9 1.3 2.2 1.45.3.15.5.13.68-.08.2-.2.75-.85.95-1.15.2-.3.4-.25.65-.15.25.1 1.6.75 1.9.9.3.15.5.2.55.35.07.15.07.85-.17 1.55z" />
      </svg>
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
