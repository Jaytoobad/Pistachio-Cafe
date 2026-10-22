import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const TABS = [
  { to: '/admin/today', label: 'Today', icon: 'dashboard' },
  { to: '/admin/orders', label: 'Orders', icon: 'orders' },
  { label: 'More', icon: 'more' },
];

export default function MobileTabBar({ onMore }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <nav className="mobile-tabbar" aria-label="Admin navigation">
      {TABS.map((t) => {
        const isMore = t.label === 'More';
        const isActive = !isMore && (pathname === t.to || pathname.startsWith(`${t.to}/`));
        return (
          <button
            key={t.label}
            className={`tab-link ${isActive ? 'active' : ''}`}
            onClick={isMore ? onMore : undefined}
            aria-pressed={isActive || undefined}
          >
            <span className="tab-icon"><Icon name={t.icon} size="20" /></span>
            <span className="tab-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
