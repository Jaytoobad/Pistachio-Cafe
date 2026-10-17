import { NavLink } from 'react-router-dom';

const icons = {
  Dashboard: '⌂',
  Orders: '🧾',
  Menu: '🍽️',
  Categories: '🗂️',
  Reviews: '⭐',
  Subscribers: '✉️',
  Settings: '⚙️',
  Staff: '👥',
};

export default function MobileTabBar({ links }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <nav className="mobile-tabbar" aria-label="Admin navigation">
      {links.map((l) => {
        const isActive = l.to === '/admin' ? pathname === '/admin' : pathname.startsWith(l.to);
        return (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin'}
            className={({ isActive: r }) => (r || isActive ? 'active' : '')}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{icons[l.label] || '•'}</span>
            <span>{l.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
