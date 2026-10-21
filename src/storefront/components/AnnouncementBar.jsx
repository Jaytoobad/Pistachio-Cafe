import { useContext, useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const MESSAGES = [
  'Fresh meals · Delivered to your door',
  'Order online · Pickup or delivery',
  'Open until 11PM weekdays',
];

export default function AnnouncementBar() {
  const { settings } = useSettings();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const banner = settings.promo_banner || '';

  useEffect(() => {
    if (reduced.current || paused || banner) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, banner]);

  useEffect(() => {
    if (banner) setIndex(0);
  }, [banner]);

  if (banner) {
    return (
      <div className="sf-announcement sf-announcement-banner" role="status" aria-live="polite">
        <span className="sf-announcement-text">{banner}</span>
      </div>
    );
  }

  return (
    <div
      className="sf-announcement"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span key={index} className="sf-announcement-text">{MESSAGES[index]}</span>
    </div>
  );
}
