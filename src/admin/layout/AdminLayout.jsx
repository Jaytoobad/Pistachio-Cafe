import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/context/AuthContext';
import { signOut } from '../../lib/services/auth';
import PageLoader from '../../lib/components/PageLoader';
import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu', label: 'Menu Sections' },
  { to: '/admin/dishes', label: 'Dishes' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/subscribers', label: 'Subscribers' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/staff', label: 'Staff' },
];

const DEFAULT_TITLE = 'Pistachio Café — Elegance you can taste';

export default function AdminLayout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const exact = links.find((l) => location.pathname === l.to);
  const page = exact ? exact.label : (links.find((l) => location.pathname.startsWith(`${l.to}/`))?.label || 'Admin');

  useEffect(() => {
    document.title = `${page} — Admin`;
    return () => { document.title = DEFAULT_TITLE; };
  }, [page]);

  if (loading) return <PageLoader />;

  async function handleLogout() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <Sidebar links={links} user={user} onLogout={handleLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <button className="sidebar-toggle" aria-label="Toggle menu">☰</button>
          <h1>Pistachio Café <span style={{ color: 'var(--color-primary)' }}>Admin</span></h1>
          <div className="admin-header-actions">
            <a className="admin-view-shop" href="/" target="_blank" rel="noopener noreferrer">View shop</a>
            <button className="admin-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <Outlet />
      </main>
      <MobileTabBar links={links} />
    </div>
  );
}


