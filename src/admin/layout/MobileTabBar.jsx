import { NavLink, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';

const ICONS = {
  Today: 'dashboard',
  Orders: 'orders',
  Menus: 'menu',
  Dishes: 'dishes',
  'Add-ons': 'addon',
  Riders: 'riders',
  Zones: 'zones',
  Customers: 'customers',
  Reviews: 'reviews',
  Subscribers: 'subscribers',
  Staff: 'staff',
  Settings: 'settings',
  'Opening hours': 'hours',
  'Daily report': 'report',
  '86 list': 'tag',
};

export default function MobileTabBar({ links, location, onItemClick }) {
  const pathname = location ? location.pathname : (typeof window !== 'undefined' ? window.location.pathname : '');

  return (
    <nav className="mobile-tabbar" aria-label="Admin navigation">
      {links.map((l) => {
        const isActive = l.to === '/admin/today' ? pathname === '/admin/today' : pathname === l.to || pathname.startsWith(`${l.to}/`);
        return (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/admin/today'}
            className={({ isActive: r }) => `tab-link ${(r || isActive) ? 'active' : ''}`}
            onClick={onItemClick}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="tab-icon"><Icon name={ICONS[l.label] || 'chevronRight'} size="20" /></span>
            <span className="tab-label">{l.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
