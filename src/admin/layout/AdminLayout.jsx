import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { signOut } from '../../lib/services/auth';
import { supabase } from '../../lib/supabase';
import { fetchSettings, updateSettings } from '../services/admin';
import Icon from '../components/Icon';
import PageLoader from '../../lib/components/PageLoader';
import MobileTabBar from './MobileTabBar';

const GROUPS = [
  {
    label: 'Operate',
    icon: 'home',
    items: [
      { to: '/admin/today', label: 'Today', icon: 'dashboard' },
      { to: '/admin/orders', label: 'Orders', icon: 'orders' },
    ],
  },
  {
    label: 'Catalogue',
    icon: 'menu',
    items: [
      { to: '/admin/menu', label: 'Menus', icon: 'menu' },
      { to: '/admin/dishes', label: 'Dishes', icon: 'dishes' },
      { to: '/admin/addons', label: 'Add-ons', icon: 'addon' },
    ],
  },
  {
    label: 'Delivery',
    icon: 'riders',
    items: [
      { to: '/admin/riders', label: 'Riders', icon: 'riders' },
      { to: '/admin/zones', label: 'Zones', icon: 'zones' },
    ],
  },
  {
    label: 'People',
    icon: 'customers',
    items: [
      { to: '/admin/customers', label: 'Customers', icon: 'customers' },
      { to: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
      { to: '/admin/subscribers', label: 'Subscribers', icon: 'subscribers' },
      { to: '/admin/staff', label: 'Staff', icon: 'staff' },
    ],
  },
  {
    label: 'Shop',
    icon: 'settings',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: 'settings' },
      { to: '/admin/hours', label: 'Opening hours', icon: 'hours' },
      { to: '/admin/report', label: 'Daily report', icon: 'report' },
      { to: '/admin/86', label: '86 list', icon: 'tag' },
    ],
  },
];

const ALL_LINKS = GROUPS.flatMap((g) => g.items);

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openOverride, setOpenOverride] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await fetchSettings();
        setSettings(s);
        setOpenOrders(s.accepting_orders !== false);
        setBusy(!!s.busy_minutes);
        setOpenOverride(s.is_open !== false);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('settings load failed', e);
      } finally {
        if (active) setSettingsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
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
    document.title = pageTitle();
    return () => { document.title = 'Pistachio Café — Admin'; };
  }, [location.pathname]);

  const exact = ALL_LINKS.find((l) => location.pathname === l.to);
  const page = exact ? exact.label : 'Admin';
  const pageTitle = () => `${page} — Pistachio Admin`;

  const saveSetting = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      setSettings((s) => ({ ...s, [key]: value }));
    } catch (e) {
      // swallow; surfaced elsewhere
    }
  };

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <button className="sidebar-toggle" aria-label="Toggle navigation" onClick={() => setSidebarCollapsed((c) => !c)}>
          <Icon name={sidebarCollapsed ? 'chevronRight' : 'menu'} size="22" />
        </button>
        <div className="admin-topbar-title">{page}</div>
        <div className="admin-topbar-controls">
          <div className="control-group">
            <button className={`topbar-toggle ${openOrders ? 'active' : ''}`} onClick={() => saveSetting('accepting_orders', !openOrders)} title={openOrders ? 'Pause online orders' : 'Resume online orders'}>
              <Icon name={openOrders ? 'pause' : 'play'} size="18" />
              <span className="toggle-label">{openOrders ? 'Paused' : 'Open'}</span>
            </button>
          </div>
          <div className="control-group">
            <button className={`topbar-toggle ${busy ? 'active' : ''}`} onClick={() => saveSetting('busy_minutes', busy ? 0 : 30)} title="Busy mode — adds extra minutes to ETA">
              <Icon name="clock" size="18" />
              <span className="toggle-label">Busy</span>
            </button>
          </div>
          <div className="control-group">
            <button className={`topbar-toggle ${openOverride ? 'active' : ''}`} onClick={() => saveSetting('is_open', !openOverride)} title="Open/closed override">
              <Icon name={openOverride ? 'pause' : 'play'} size="18" />
              <span className="toggle-label">{openOverride ? 'Closed' : 'Open'}</span>
            </button>
          </div>
          <div className="new-order-badge" title={`New paid orders: ${newOrderCount}`}>
            <Icon name="orders" size="18" />
            <span className="badge-count">{newOrderCount}</span>
          </div>
          <button className="admin-logout" onClick={handleLogout}><Icon name="logout" size="16" style={{ marginRight: 6 }} /> Sign out</button>
        </div>
      </header>
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Admin navigation">
        <div className="admin-brand" onClick={() => setSidebarCollapsed((c) => !c)}><Icon name="home" size="20" color="var(--color-pistachio)" /><span>{sidebarCollapsed ? 'PC' : 'Pistachio Café'}</span></div>
        <nav>
          {GROUPS.map((group) => (
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
      <MobileTabBar links={ALL_LINKS} location={location} />
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu"><Icon name="close" size="20" /></button>
        <nav>
          {GROUPS.map((group) => (
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
    </div>
  );
}
