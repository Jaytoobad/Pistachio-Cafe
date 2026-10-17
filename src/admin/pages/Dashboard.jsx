import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchOrders } from '../services/admin';
import { formatMoney, isTodayAccra } from '../../lib/format';
import PageLoader from '../../lib/components/PageLoader';
import StatusPill from '../../lib/components/StatusPill';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchOrders({ status: ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'] });
      setOrders(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayOrders = useMemo(() => orders.filter((o) => isTodayAccra(o.created_at)), [orders]);
  const paidToday = useMemo(() => todayOrders.filter((o) => o.payment_status === 'paid'), [todayOrders]);
  const pending = useMemo(() => orders.filter((o) => o.status === 'received' || o.payment_status === 'pending_payment'), [orders]);

  const revenueToday = useMemo(() => paidToday.reduce((sum, o) => sum + Number(o.total || 0), 0), [paidToday]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="page">
        <div className="page-header"><h1>Dashboard</h1></div>
        <p className="empty-state">Could not load dashboard. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-sub">Today at Pistachio Café</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Orders today</div>
          <div className="stat-value">{todayOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue today</div>
          <div className="stat-value">{formatMoney(revenueToday)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid orders</div>
          <div className="stat-value">{paidToday.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending / unpaid</div>
          <div className="stat-value">{pending.length}</div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Time</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td className="cell-muted">{o.order_code || o.id}</td>
                  <td>{o.customer_name}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td><StatusPill status={o.payment_status} small /></td>
                  <td>{formatMoney(o.total || 0)}</td>
                  <td className="cell-muted">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
