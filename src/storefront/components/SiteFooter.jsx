import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP, IMAGES } from '../config';
import { FOOTER_LINES, HERO_HOURS_TEXT } from '../data/content';
import { subscribeNewsletter } from '../services/newsletter';
import { INSTAGRAM_SVG, WHATSAPP_SVG } from './icons';
import SafeImg from './SafeImg';

const exploreLinks = [
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'Our story' },
  { to: '/visit', label: 'Visit us' },
  { to: '/track', label: 'Track an order' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/delivery-info', label: 'Delivery info' },
];

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const year = new Date().getFullYear();

  async function handleSubscribe(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await subscribeNewsletter(email);
      setMessage(result.alreadySubscribed ? 'You are already on the list.' : 'Thanks for subscribing.');
      setEmail('');
    } catch (error) {
      setMessage(error?.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <SafeImg
              src={IMAGES.logo}
              label="Pistachio Caf&eacute;"
              alt="Pistachio Caf&eacute;"
              className="footer-brand-logo"
            />
            {FOOTER_LINES.map((line) => (
              <p className="footer-brand-text" key={line}>
                {line}
              </p>
            ))}

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                required
              />
              <button type="submit" disabled={busy}>
                {busy ? 'Joining\u2026' : 'Join'}
              </button>
            </form>
            {message && <p className="newsletter-note">{message}</p>}

            <div className="social-row">
              {BRAND.instagramUrl && (
                <a href={BRAND.instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  {INSTAGRAM_SVG}
                </a>
              )}
              {HAS_WHATSAPP && CONTACT.whatsapp && (
                <a href={`https://wa.me/${CONTACT.whatsapp}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                  {WHATSAPP_SVG}
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="footer-heading">Explore</h2>
            <ul className="footer-links">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer-heading">Visit</h2>
            <ul className="footer-links">
              <li>{CONTACT.address}</li>
              <li>{HERO_HOURS_TEXT}</li>
              {HAS_PHONE && CONTACT.phone && (
                <li>
                  <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
                </li>
              )}
              {HAS_WHATSAPP && CONTACT.whatsapp && (
                <li>
                  <a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {year} Pistachio Caf&eacute;. All rights reserved.
          </span>
          <div className="footer-legal">
            {legalLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
