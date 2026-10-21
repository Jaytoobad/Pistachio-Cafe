import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchOrderById,
  fetchOrderHistory,
  updateOrderStatus,
  cancelOrder,
  setRider,
  fetchRiders,
  STATUS_LABELS,
} from '../services/admin';
import { formatMoney, formatAccra, minutesAgo } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import Icon from './Icon';
import ConfirmDialog from '../../lib/components/ConfirmDialog';

const STATUS_ORDER = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed'];

function toWhatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.startsWith('0') ? `233${digits.slice(1)}` : digits;
}

export default function OrderDrawer({ open, onClose, orderId }) {
  const { showToast } = useToast();
  const { id: paramId } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = new Map();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const targetId = orderId || paramId;

  useEffect(() => {
    if (!targetId) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchOrderById(targetId),
      fetchOrderHistory(targetId).catch(() => []),
      fetchRiders().catch(() => []),
    ])
      .then(([o, h, r]) => { if (active) { setOrder(o); setHistory(h); setRiders(r); } })
      .catch(() => { if (active) setOrder(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [targetId]);

  const setSavingState = (key, v) => {
    const next = new Map(saving);
    if (v) next.set(key, true); else next.delete(key);
    setSaving(next);
  };

  const itemName = (it) => it.name || it.dish_name || 'Item';
  const itemQty = (it) => it.qty != null ? it.qty : it.quantity;

  const handleStatus = async (status) => {
    if (!order || status === order.status) return;
    setSavingState('status', true);
    try {
      await updateOrderStatus(order.id, status, `Moved to ${STATUS_LABELS[status] || status}`);
      setOrder((o) => ({ ...o, status }));
      showToast(`Order ${order.order_code} moved to ${STATUS_LABELS[status] || status}`);
    } catch (err) {
      showToast(err?.message || 'Could not update status.', 'error');
    } finally {
      setSavingState('status', false);
    }
  };

  const handleRider = async (riderId) => {
    if (!order) return;
    setSavingState('rider', true);
    try {
      await setRider(order.id, riderId || null);
      setOrder((o) => ({ ...o, rider_id: riderId || null }));
      showToast('Rider assigned');
    } catch (err) {
      showToast(err?.message || 'Could not assign rider.', 'error');
    } finally {
      setSavingState('rider', false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirmCancel.reason) return;
    setSavingState('cancel', true);
    try {
      await cancelOrder(order.id, confirmCancel.reason);
      setOrder((o) => ({ ...o, status: 'cancelled' }));
      showToast('Order cancelled');
    } catch (err) {
      showToast(err?.message || 'Could not cancel order.', 'error');
    } finally {
      setSavingState('cancel', false);
      setConfirmCancel(false);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=80mm,height=auto');
    if (!win) return;
    win.document.write(ticketHtml(order));
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  if (!open) return null;
  if (loading) return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sk-text" style={{ width: 120, height: 16 }} />
    </div>
  );

  const waText = `Hi ${order && order.customer_name}, your Pistachio order ${order.order_code} is on its way`;
  const waNum = toWhatsAppNumber(order && order.phone);
  const isRealWa = waNum && waNum !== '233000000000' && /[1-9]/.test(waNum);
  const waLink = isRealWa ? `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}` : null;
  const telLink = `tel:${order && order.phone}`;

  return (
    <div className="modal-overlay order-drawer-overlay" role="dialog" aria-modal="true" aria-label="Order details" onClick={onClose} style={{ alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40 }}>
      <div className="modal order-drawer" onClick={(e) => e.stopPropagation()} style={{ minHeight: '40vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ flex: 1 }}>Order {order ? order.order_code : 'â€”'}</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}><Icon name="close" size="16" /></button>
        </div>

        {!order && (
          <div className="empty-state error-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <h3>Order not found</h3>
          </div>
        )}

        {order && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 4, display: 'grid', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.order_code}</span>
                <span className="pill" style={{ background: '#EAF3EC', color: '#3D6A46' }}>{order.payment_status === 'paid' ? 'Paid' : 'Pending payment'}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{minutesAgo(order.created_at)}m ago</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{formatAccra(order.created_at)} &bull; {order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Items</h4>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
                {(order.order_items || []).map((it) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontWeight: 600, flex: 1 }}>{itemName(it)}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{itemQty(it)} &times;</span>
                    <span style={{ fontWeight: 700 }}>{formatMoney(Number(it.unit_price || 0) * Number(itemQty(it) || 0))}</span>
                  </div>
                ))}
                {order.order_items.length === 0 && <div style={{ padding: 10, color: 'var(--color-text-muted)' }}>(no items)</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px', borderTop: '1px solid var(--color-border)', fontWeight: 700 }}>
                  Total {formatMoney(order.total || 0)}
                </div>
              </div>
            </div>

            {order.notes && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Notes</h4>
                <p style={{ color: 'var(--color-ink)' }}>{order.notes}</p>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Customer</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, minWidth: 90 }}>Name</span>
                  <span>{order.customer_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, minWidth: 90 }}>Phone</span>
                  <a href={telLink} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{order.phone}</a>
                </div>
                {order.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 90 }}>Address</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{order.address}</span>
                  </div>
                )}
                {order.landmark && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 90 }}>Landmark</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{order.landmark}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Actions</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={telLink} className="btn btn-outline btn-sm"><Icon name="phone" size="16" style={{ marginRight: 6 }} /> Call {order.customer_name.split(' ')[0]}</a>
                {waLink && <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><Icon name="whatsapp" size="16" style={{ marginRight: 6 }} /> Message on WhatsApp</a>}
                {!waLink && <button className="btn btn-outline btn-sm" disabled><Icon name="whatsapp" size="16" style={{ marginRight: 6 }} /> Message on WhatsApp</button>}
                <button className="btn btn-outline btn-sm no-print" onClick={handlePrint}><Icon name="print" size="16" style={{ marginRight: 6 }} /> Print kitchen ticket</button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, minWidth: 110 }}>Status</span>
                <select
                  value={order.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={saving.has('status') || order.status === 'completed' || order.status === 'cancelled'}
                  className="btn-outline"
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}
                >
                  <option value={order.status} disabled>â€” Change status â€”</option>
                  {STATUS_ORDER.filter((s) => STATUS_ORDER.indexOf(s) > STATUS_ORDER.indexOf(order.status)).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => handleStatus(selectedStatus)} disabled={!selectedStatus || saving.has('status')}>{saving.has('status') ? 'â€¦' : 'Move'}</button>
              </div>

              {order.fulfilment === 'delivery' && order.status !== 'completed' && order.status !== 'cancelled' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, minWidth: 110 }}>Rider</span>
                  <select
                    value={order.rider_id || ''}
                    onChange={(e) => handleRider(e.target.value || null)}
                    disabled={saving.has('rider')}
                    className="btn-outline"
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}
                  >
                    <option value="">â€” No rider â€”</option>
                    {riders.filter((r) => r.is_active !== false).map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmCancel({ reason: '' })} disabled={saving.has('cancel')}>Cancel order</button>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Status timeline</h4>
              <div className="status-timeline">
                {history.map((h) => (
                  <div key={h.created_at} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', marginBottom: 8 }}>
                    <div className="timeline-dot" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{STATUS_LABELS[h.status] || h.status}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{formatAccra(h.created_at)}</div>
                    </div>
                    {h.note && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{h.note}</span>}
                  </div>
                ))}
                {!history.length && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No status changes yet.</p>}
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmCancel}
          title="Cancel order?"
          message={`Cancel ${order ? order.order_code : 'this order'}? Reason: "${confirmCancel.reason}". This cannot be undone.`}
          confirmLabel="Cancel order"
          cancelLabel="Keep"
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancel(false)}
        />
      </div>
    </div>
  );
}

function ticketHtml(order) {
  const items = (order.order_items || []).map((it) => {
    const qty = it.qty != null ? it.qty : it.quantity;
    return `<tr><td class="name">${escapeHtml(it.name || it.dish_name || 'Item')}</td><td class="qty">${qty}</td><td class="price">${formatMoney(Number(it.unit_price || 0) * Number(qty || 0))}</td></tr>`;
  }).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:'Work Sans', sans-serif;font-size:7.5pt;line-height:1.3;color:#000;margin:0;padding: '6px' 8px;}
  .ticket-head{text-align:center;border-bottom: '16px' double #000;padding-bottom: '4px';margin-bottom: '6px';}
  .ticket-head h2{margin:0;font-size:13pt;text-transform:uppercase;letter-spacing: '0.2em';}
  .ticket-head p{margin: '2px' 0;font-size:7pt;}
  hr{border:none;border-top: '1px' dashed #000;margin: '4px' 0;}
  table{width: '100%';border-collapse:collapse;}
  td{padding: '2px' 0;font-size:7.5pt;}
  .name{text-align:left;}.qty{text-align:center;width: '24px';}.price{text-align:right;}
  .ticket-total{border-top: '16px' double #000;margin-top: '6px';padding-top: '4px';font-weight:700;text-align:right;}
  .ticket-foot{margin-top: '6px';font-size:7pt;text-align:center;color:#333;}
  .no-print{display:none;}
  @page{size:80mm auto;margin:0;}
  @media print{body *{visibility:hidden}.ticket,.ticket *{visibility:visible}.ticket{position:static;width:80mm;margin:0;box-shadow:none;border:none;}body{background:#fff;padding:0;}}
  </style></head><body>
  <div class="ticket">
    <div class="ticket-head"><h2>Pistachio CafÃ©</h2><p>Spintex, Accra &bull; Order ${escapeHtml(order.order_code)}</p><p>${formatAccra(order.created_at)} &bull; ${order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p></div>
    <table class="ticket-items"><tbody>${items || '<tr><td>No items</td></tr>'}</tbody></table>
    <hr />
    <div class="ticket-total">Subtotal ${formatMoney(order.subtotal || 0)}<br />${order.delivery_fee > 0 ? `Delivery ${formatMoney(order.delivery_fee)}<br />` : ''}Total ${formatMoney(order.total || 0)}</div>
    <div class="ticket-foot">${order.payment_reference ? `Paid via Paystack &bull; Ref ${escapeHtml(order.payment_reference)}` : 'Payment pending'}<br />${order.notes ? `Notes: ${escapeHtml(order.notes)}` : ''}</div>
  </div>
  </body></html>`;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

