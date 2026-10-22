import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, STATUS_LABELS } from '../services/admin';
import { formatMoney, isTodayAccra } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import { AdminSkeletonCards, AdminSkeletonText } from '../components/Skeletons';
import { AdminEmptyState, AdminErrorState } from '../components/States';

const NEXT_STATUS = {
  received: 'confirmed', confirmed: 'preparing', preparing: 'ready',
  ready: 'out_for_delivery', out_for_delivery: 'delivered', delivered: 'completed',
  completed: null, cancelled: null,
};

export default function Today() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dateFrom = todayStart.toISOString();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const rows = await fetchOrders({ dateFrom });
      setOrders(rows.filter((o) => isTodayAccra(o.created_at)));
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, [dateFrom]);

  useEffect(() => { load(); }, [load]);

  const todayOrders = orders;
  const waiting = todayOrders.filter((o) => o.status === 'received' || o.status === 'confirmed').length;
  const preparing = todayOrders.filter((o) => o.status === 'preparing').length;
  const outForDelivery = todayOrders.filter((o) => o.status === 'out_for_delivery' || o.status === 'delivered').length;
  const completed = todayOrders.filter((o) => o.status === 'completed').length;
  const revenueToday = todayOrders.filter((o) => o.payment_status === 'paid')
    .reduce((s, o) => s + Number(o.total || 0), 0);

  const latest = todayOrders.slice(0, 10);

  const handleAdvance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next, `Moved to ${STATUS_LABELS[next]}`);
      showToast(`Order ${order.order_code} \u2192 ${STATUS_LABELS[next]}`);
      load();
    } catch (err) {
      showToast(err?.message || 'Could not update order.', 'error');
    }
  };

  if (loading) return (
    <div className="page page-shell">
      <div className="page-header">
        <div><h1>Today</h1><p className="page-sub">Today at Pistachio Caf\u00e9</p></div>
        <div className="page-header-actions"><Link to="/admin/orders" className="btn btn-primary">View all orders</Link></div>
      </div>
      <div className="filters">
        <AdminSkeletonText width="30%" /><AdminSkeletonText width="20%" />
      </div>
      <AdminSkeletonCards count={4} />
      <AdminSkeletonCards count={5} />
    </div>
  );
  if (loadError) return (
    <div className="page page-shell">
      <div className="page-header">
        <div><h1>Today</h1><p className="page-sub">Today at Pistachio Caf\u00e9</p></div>
        <div className="page-header-actions"><Link to="/admin/orders" className="btn btn-primary">View all orders</Link></div>
      </div>
      <AdminErrorState message="Could not load today\u2019s dashboard." onRetry={load} />
    </div>
  );

  const statGroups = [
    { label: 'Waiting', value: waiting },
    { label: 'Preparing', value: preparing },
    { label: 'Out for delivery', value: outForDelivery },
    { label: 'Completed', value: completed },
    { label: 'Revenue today', value: formatMoney(revenueToday) },
  ];

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div><h1>Today</h1><p className="page-sub">Today at Pistachio Caf\u00e9</p></div>
        <div className="page-header-actions"><Link to="/admin/orders" className="btn btn-primary">View all orders</Link></div>
      </div>

      <div className="filters">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Showing <select style={{ padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}><option>All orders</option><option>Paid only</option></select>
        </label>
      </div>

      <div className="stat-grid">
        {statGroups.map((g) => (
          <div key={g.label} className="stat-card">
            <div className="stat-label">{g.label}</div>
            <div className="stat-value">{g.value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 10px' }}>Latest orders</h2>

      {latest.length === 0 ? (
        <AdminEmptyState title="No orders yet" description="New orders appear here." />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {latest.map((order) => {
                const next = NEXT_STATUS[order.status];
                return (
                  <tr key={order.id}>
                    <td className="cell-primary">{order.order_code}</td>
                    <td>{order.customer_name}</td>
                    <td>{formatMoney(order.total)}</td>
                    <td><span className={`pill ${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span></td>
                    <td>
                      {next ? (
                        <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); handleAdvance(order); }}>
                          Move to {STATUS_LABELS[next]}
                        </button>
                      ) : (
                        <span className="pill muted">Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
