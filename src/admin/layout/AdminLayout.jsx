import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { signOut } from '../../lib/services/auth';
import { supabase } from '../../lib/supabase';
import { fetchSettings, updateSettings } from '../services/admin';
import Icon from '../components/Icon';
import MobileTabBar from './MobileTabBar';

const GROUPS = [
  {
    label: 'Today & orders',
    icon: 'dashboard',
    items: [
      { to: '/admin/today', label: 'Today', icon: 'dashboard' },
      { to: '/admin/orders', label: 'Orders', icon: 'orders' },
    ],
  },
  {
    label: 'Menus & dishes',
    icon: 'menu',
    items: [
      { to: '/admin/menu', label: 'Menus', icon: 'menu' },
      { to: '/admin/dishes', label: 'Dishes', icon: 'dishes' },
    ],
  },
  {
    label: 'Riders & delivery zones',
    icon: 'riders',
    items: [
      { to: '/admin/riders', label: 'Riders', icon: 'riders' },
      { to: '/admin/zones', label: 'Delivery zones', icon: 'zones' },
    ],
  },
  {
    label: 'Customers, reviews, subscribers & staff',
    icon: 'customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: 'customers' },
      { to: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
      { to: '/admin/subscribers', label: 'Subscribers', icon: 'subscribers' },
      { to: '/admin/staff', label: 'Staff', icon: 'staff' },
    ],
  },
  {
    label: 'Settings',
    icon: 'settings',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

const ALL_LINKS = GROUPS.flatMap((g) => g.items);

const PAGE_TITLES = {
  '/admin/today': 'Today',
  '/admin/orders': 'Orders',
  '/admin/menu': 'Menus',
  '/admin/dishes': 'Dishes',
  '/admin/riders': 'Riders',
  '/admin/zones': 'Delivery zones',
  '/admin/customers': 'Customers',
  '/admin/reviews': 'Reviews',
  '/admin/subscribers': 'Subscribers',
  '/admin/staff': 'Staff',
  '/admin/settings': 'Settings',
};

function pageTitleFor(pathname) {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;
  if (pathname === '/admin' || pathname === '/admin/') return 'Today';
  const seg = pathname.split('/').filter(Boolean).pop();
  return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : 'Admin';
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const page = pageTitleFor(location.pathname);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await fetchSettings();
        setSettings(s);
        setAcceptingOrders(s.accepting_orders !== false);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('settings load failed', e);
      } finally {
        if (active) setSettingsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('admin-topbar');
    const handleInsert = (payload) => {
      const order = payload.new;
      if (order.payment_status === 'paid') setNewOrderCount((c) => c + 1);
    };
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, handleInsert)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    document.title = `${page} \u2014 Pistachio Admin`;
    return () => { document.title = 'Pistachio Caf\u00e9 \u2014 Admin'; };
  }, [location.pathname, page]);

  async function saveSetting(key, value) {
    try {
      await updateSettings({ [key]: value });
      setSettings((s) => ({ ...s, [key]: value }));
    } catch (e) {
      // swallowed; setting still toggled optimistically above
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  const exact = ALL_LINKS.find((l) => location.pathname === l.to);
  const activeTo = exact ? exact.to : null;

  const visibleGroups = isAdmin ? GROUPS : GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.to === '/admin/today' || i.to === '/admin/orders'),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <button className="sidebar-toggle" aria-label="Toggle navigation" onClick={() => setSidebarCollapsed((c) => !c)}>
          <Icon name={sidebarCollapsed ? 'chevronRight' : 'menu'} size="22" />
        </button>
        <h1 className="admin-title">{page}</h1>
        <div className="admin-topbar-controls">
          {isAdmin && (
            <div className="control-group accepting-switch">
              <input
                id="accepting-orders"
                type="checkbox"
                checked={acceptingOrders}
                onChange={(e) => {
                  setAcceptingOrders(e.target.checked);
                  saveSetting('accepting_orders', e.target.checked);
                }}
              />
              <label htmlFor="accepting-orders">Accepting online orders</label>
            </div>
          )}
          <div className="control-group user-menu" onClick={(e) => { e.stopPropagation(); setUserMenuOpen((o) => !o); }}>
            <div className="user-email" title={user?.email || ''}>{user?.email || 'Signed in'}</div>
            <Icon name="chevronDown" size="14" style={{ marginLeft: 6 }} />
            {userMenuOpen && (
              <div className="user-menu-popup">
                <div className="user-menu-item" role="button" onClick={() => { setUserMenuOpen(false); }}>{user?.email}</div>
                <button className="user-menu-item admin-logout" onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
          <div className="control-group new-order-badge" title={`New paid orders: ${newOrderCount}`} aria-label={`New paid orders: ${newOrderCount}`}>
            <Icon name="orders" size="16" />
            <span className="badge-count">{newOrderCount}</span>
          </div>
        </div>
      </header>
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Admin navigation">
        <div className="admin-brand" onClick={() => setSidebarCollapsed((c) => !c)}><Icon name="home" size="20" color="var(--color-pistachio)" /><span>{sidebarCollapsed ? 'PC' : 'Pistachio Caf\u00e9'}</span></div>
        <nav>
          {visibleGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <h3 className="nav-group-label">{group.label}</h3>
              {group.items.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== '/admin/today' && location.pathname.startsWith(`${item.to}/`));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className="nav-icon"><Icon name={item.icon} size="18" /></span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="user-email" title={user?.email || ''}>{user?.email || 'Signed in'}</span>
          </div>
          <button className="admin-logout" onClick={handleLogout}><Icon name="logout" size="16" style={{ marginRight: 6 }} /> Sign out</button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>

      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><Icon name="close" size="20" /></button>
        <nav>
          {visibleGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <h3 className="nav-group-label">{group.label}</h3>
              {group.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className="nav-icon"><Icon name={item.icon} size="18" /></span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer" style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="user-email" title={user?.email || ''}>{user?.email || 'Signed in'}</span>
          </div>
          <button className="admin-logout" onClick={handleLogout}><Icon name="logout" size="16" style={{ marginRight: 6 }} /> Sign out</button>
        </div>
      </div>

      <MobileTabBar onMore={() => setDrawerOpen(true)} />

      {loading ? <div className="admin-shell-loading" /> : null}
    </div>
  );
}
