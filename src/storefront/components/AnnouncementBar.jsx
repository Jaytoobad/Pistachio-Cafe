import { useEffect, useRef, useState } from 'react';

const MESSAGES = [
  'Fresh meals \u00b7 Delivered to your door',
  'Order online \u00b7 Pickup or delivery',
  'Open until 11PM weekdays',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (reduced.current || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

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
