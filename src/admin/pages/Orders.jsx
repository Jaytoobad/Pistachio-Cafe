import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders, updateOrderStatus, cancelOrder, STATUS_LABELS } from '../services/admin';
import { formatMoney, minutesAgo } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import { supabase } from '../../lib/supabase';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import { AdminErrorState } from '../components/States';
import OrderDrawer from '../components/OrderDrawer';
import Icon from '../components/Icon';

const COLUMNS = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const NEXT_STATUS = {
  received: 'confirmed', confirmed: 'preparing', preparing: 'ready',
  ready: 'out_for_delivery', out_for_delivery: 'delivered', delivered: 'completed',
  completed: null, cancelled: null,
};
const SOUND_MUTE_KEY = 'pistachio:orders:mute';

function tone({ frequency = 880, duration = 160, type = 'sine', volume = 0.12 }) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration / 1000);
    ctx.close().catch(() => {});
  } catch { /* best-effort only */ }
}
function playNewOrderSound(muted) {
  if (muted) return;
  tone({ frequency: 987.77, duration: 150 });
  setTimeout(() => tone({ frequency: 1318.51, duration: 220 }), 120);
}

export default function Orders() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [paidOnly, setPaidOnly] = useState(true);
  const [tab, setTab] = useState('board');
  const [muted, setMuted] = useState(localStorage.getItem(SOUND_MUTE_KEY) === '1');
  const [flashing, setFlashing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [hFrom, setHFrom] = useState('');
  const [hTo, setHTo] = useState('');
  const [hSearch, setHSearch] = useState('');
  const [drawer, setDrawer] = useState({ open: false, id: null });
  const channelRef = useRef(null);
  const badgeRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const rows = await fetchOrders({ paymentStatus: paidOnly ? 'paid' : undefined });
      setOrders(rows);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, [paidOnly]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    muted ? localStorage.setItem(SOUND_MUTE_KEY, '1') : localStorage.removeItem(SOUND_MUTE_KEY);
  }, [muted]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('orders-board');
    const handleInsert = (payload) => {
      const order = payload.new;
      if (order.payment_status !== 'paid') return;
      if (orders.some((o) => o.id === order.id)) return;
      setOrders((cur) => [order, ...cur]);
      playNewOrderSound(muted);
      showToast(`New paid order ${order.order_code}`);
      setFlashing(true);
      if (badgeRef.current) badgeRef.current.classList.add('flash');
      setTimeout(() => { badgeRef.current?.classList.remove('flash'); setFlashing(false); }, 1500);
    };
    const handleUpdate = (payload) => {
      const order = payload.new;
      setOrders((cur) => cur.map((o) => (o.id === order.id ? order : o)));
    };
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, handleInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, handleUpdate)
      .subscribe();
    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [muted, orders.length, showToast]);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next, `Moved to ${STATUS_LABELS[next]}`);
      showToast(`Order ${order.order_code} \u2192 ${STATUS_LABELS[next]}`);
    } catch (err) {
      showToast(err?.message || 'Could not update order.', 'error');
    }
  };

  const handleCancel = async () => {
    if (!confirm) return;
    try {
      await cancelOrder(confirm.id, 'Cancelled from orders board.');
      showToast(`Order ${confirm.order_code} cancelled`);
    } catch (err) {
      showToast(err?.message || 'Could not cancel order.', 'error');
    }
    setConfirm(null);
  };

  const openDrawer = (id) => setDrawer({ open: true, id });

  const boardOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'delivered');
  const historyOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled' || o.status === 'delivered');

  const term = hSearch.replace(/[,()%*]/g, ' ').trim().toLowerCase();
  const history = historyOrders.filter((o) => {
    if (hFrom && o.created_at < hFrom) return false;
    if (hTo && o.created_at > `${hTo}T23:59:59`) return false;
    if (term && ![o.order_code, o.customer_name, o.phone].some((v) => String(v || '').toLowerCase().includes(term))) return false;
    return true;
  });

  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div className="page page-shell">
        <div className="page-header"><h1>Live Orders</h1><p className="page-sub">Kanban board &mdash; updates live</p></div>
        <AdminErrorState message="Could not load orders." onRetry={load} />
      </div>
    );
  }

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Live Orders</h1>
          <p className="page-sub">Kanban board &mdash; updates live</p>
        </div>
        <div className="page-header-actions">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={paidOnly} onChange={(e) => setPaidOnly(e.target.checked)} style={{ width: 16, height: 16 }} /> Paid orders only
          </label>
          <button className="btn btn-outline btn-sm" onClick={() => setMuted((m) => !m)}>{muted ? 'Unmute' : 'Mute'} sound</button>
          <span ref={badgeRef} className={flashing ? 'new-order-badge flash-badge' : 'new-order-badge'} title="New paid orders">{orders.filter((o) => o.payment_status === 'paid').length}</span>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm} title="Cancel order?" message={`Cancel ${confirm.order_code}?`}
        confirmLabel="Cancel" cancelLabel="Keep" onConfirm={handleCancel} onCancel={() => setConfirm(null)} />
      <OrderDrawer open={drawer.open} onClose={() => setDrawer({ open: false, id: null })} orderId={drawer.id} />

      <nav className="orders-tabs" style={{ marginBottom: 12, display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        <button className={tab === 'board' ? 'tab-active' : ''} onClick={() => setTab('board')} style={{ padding: '10px 16px', border: 'none', background: 'transparent', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>Board</button>
        <button className={tab === 'history' ? 'tab-active' : ''} onClick={() => setTab('history')} style={{ padding: '10px 16px', border: 'none', background: 'transparent', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>History</button>
      </nav>

      {tab === 'board' ? (
        <>
          <div className="kanban-board">
            {COLUMNS.map((key) => {
              const colOrders = boardOrders.filter((o) => o.status === key);
              return (
                <div key={key} className="kanban-col">
                  <div className="kanban-head">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{STATUS_LABELS[key]}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>{colOrders.length}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {colOrders.map((order) => (
                      <div key={order.id} className="order-card" onClick={() => openDrawer(order.id)}>
                        <div className="order-card-head">
                          <span className="order-code">{order.order_code}</span>
                          <span className="pill" style={{ background: order.payment_status === 'paid' ? '#E8F0E4' : '#F1ECE9', color: order.payment_status === 'paid' ? 'var(--color-success)' : '#6B5F5A' }}>{order.payment_status === 'paid' ? 'Paid' : 'Pending'}</span>
                        </div>
                        <div className="order-card-customer">{order.customer_name}</div>
                        <div className="order-card-items">
                          {(order.order_items || []).map((it) => `${it.qty != null ? it.qty : it.quantity} &times; ${it.name || it.dish_name}`).join(', ') || '\u2014'}
                        </div>
                        <div className="order-card-meta">
                          <span className="order-card-total">{formatMoney(order.total)}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '100px' }}>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                          <span className={minutesAgo(order.created_at) > 30 ? 'age age-critical' : minutesAgo(order.created_at) > 15 ? 'age age-warn' : 'age'}>{minutesAgo(order.created_at)}m</span>
                        </div>
                        <div className="order-card-actions">
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); advance(order); }} disabled={order.status === 'cancelled'}>Advance to {NEXT_STATUS[order.status]}</button>
                          )}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setConfirm(order); }}>Cancel</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {colOrders.length === 0 && <div className="col-empty">\u2014</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="form-hint">Paid orders arrive live. Times warn at 15&nbsp;min and go critical at 30&nbsp;min. Tap an order for details.</p>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              From <input type="date" value={hFrom} onChange={(e) => setHFrom(e.target.value)} style={{ padding: 4 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              To <input type="date" value={hTo} onChange={(e) => setHTo(e.target.value)} style={{ padding: 4 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Search <input value={hSearch} onChange={(e) => setHSearch(e.target.value)} style={{ padding: 4 }} />
            </label>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th>Actions</th></tr></thead>
              <tbody>
                {history.map((o) => (
                  <tr key={o.id}>
                    <td className="cell-primary"><a href={`/admin/orders/${o.id}`}>{o.order_code}</a></td>
                    <td>{o.customer_name}</td>
                    <td>{o.phone}</td>
                    <td className="cell-muted" style={{ fontSize: 0.85 }}>{(o.order_items || []).map((i) => `${i.qty != null ? i.qty : i.quantity}&times;`).join(' ')}</td>
                    <td>{formatMoney(o.total)}</td>
                    <td><span className="pill">{STATUS_LABELS[o.status] || o.status}</span></td>
                    <td className="cell-muted">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="table-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => openDrawer(o.id)}>Open</button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={8} className="empty-state" style={{ padding: 30, textAlign: 'center' }}>No history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
