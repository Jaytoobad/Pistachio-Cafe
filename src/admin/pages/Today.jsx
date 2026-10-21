import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardStats, ORDER_STATUSES } from '../services/admin';
import { formatMoney, formatAccra } from '../../lib/format';
import { AdminSkeletonCards, AdminSkeletonText } from '../components/Skeletons';
import { AdminEmptyState, AdminErrorState } from '../components/States';
import RevenueChart from './charts/RevenueChart';
import OrderDrawer from '../components/OrderDrawer';

const STATUS_GROUPS = [
  { key: ['received', 'confirmed'], label: 'Waiting', icon: 'clock', tone: 'warn' },
  { key: ['preparing', 'ready'], label: 'In kitchen', icon: 'dishes', tone: 'prep' },
  { key: ['out_for_delivery', 'delivered'], label: 'Out for delivery', icon: 'riders', tone: 'ready' },
  { key: ['completed'], label: 'Completed', icon: 'check', tone: 'done' },
];

export default function Today() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawer, setDrawer] = useState({ open: false, id: null });

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      setStats(await fetchDashboardStats());
    } catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="page page-shell">
      <div className="page-header"><h1>Today</h1><p className="page-sub">Today at Pistachio CafÃ©</p></div>
      <AdminSkeletonCards count={4} />
      <AdminSkeletonText width="100%" /> <AdminSkeletonText width="60%" />
      <AdminSkeletonCards count={5} />
    </div>
  );
  if (error) return (
    <div className="page page-shell">
      <div className="page-header"><h1>Today</h1><p className="page-sub">Today at Pistachio CafÃ©</p></div>
      <AdminErrorState message="Could not load today's dashboard." onRetry={load} />
    </div>
  );
  if (!stats) return null;

  const { waiting, inKitchen, outForDelivery, completed, revenueToday, aov, ordersToday, busiestHour, bestSellers, revenueChart } = stats;

  const groups = [
    { label: 'Waiting', value: waiting, tone: 'warn' },
    { label: 'In kitchen', value: inKitchen, tone: 'prep' },
    { label: 'Out for delivery', value: outForDelivery, tone: 'ready' },
    { label: 'Completed', value: completed, tone: 'done' },
  ];

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Today</h1>
          <p className="page-sub">Today at Pistachio CafÃ©</p>
        </div>
        <div className="page-header-actions">
          <Link to="/admin/orders" className="btn btn-primary">View all orders</Link>
        </div>
      </div>

      <div className="stat-grid">
        {groups.map((g) => {
          const color = g.tone === 'warn' ? 'var(--color-warn)' : g.tone === 'prep' ? '#8A5A14' : g.tone === 'ready' ? '#2D6B8F' : 'var(--color-success)';
          return (
            <div key={g.label} className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="stat-label">{g.label}</div>
              <div className="stat-value">{g.value}</div>
            </div>
          );
        })}
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-primary)' }}>
          <div className="stat-label">Revenue today</div>
          <div className="stat-value">{formatMoney(revenueToday)}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #6B5F5A' }}>
          <div className="stat-label">Average order value</div>
          <div className="stat-value">{formatMoney(aov)}</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--color-text-muted)' }}>
          <div className="stat-label">Orders today</div>
          <div className="stat-value">{ordersToday}</div>
        </div>
      </div>

      <div className="report-filters" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Busiest hour</span>
        <span style={{ marginLeft: 10, fontSize: '1rem', fontWeight: 700, color: 'var(--color-ink)' }}>{busiestHour}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div className="chart-wrap">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Revenue â€” last 7 days</h3>
          <RevenueChart data={revenueChart} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Best sellers today</h3>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
            {bestSellers.length ? bestSellers.map(([name, qty]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>{name}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{qty}</span>
              </div>
            )) : <div style={{ padding: 12, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No sales yet.</div>}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 10px' }}>Recent orders</h3>
      <OrderDrawer open={drawer.open} onClose={() => setDrawer({ open: false, id: null })} orderId={drawer.id} />

      <AdminEmptyState title="No recent orders" description="Orders placed today will appear here." />
    </div>
  );
}

