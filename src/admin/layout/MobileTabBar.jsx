import { NavLink } from 'react-router-dom';
import Icon from '../components/Icon';

const TABS = [
  { to: '/admin', label: 'Today', icon: 'dashboard' },
  { to: '/admin/orders', label: 'Orders', icon: 'orders' },
  { label: 'More', icon: 'more' },
];

export default function MobileTabBar({ onMore }) {
  return (
    <nav className="mobile-tabbar" aria-label="Admin navigation">
      {TABS.map((t) => {
        const isMore = t.label === 'More';
        if (isMore) {
          return (
            <button key={t.label} type="button" className="tab-link" onClick={onMore} aria-haspopup="true">
              <span className="tab-icon"><Icon name={t.icon} size="20" /></span>
              <span className="tab-label">{t.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={t.label}
            to={t.to}
            end
            className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon"><Icon name={t.icon} size="20" /></span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
