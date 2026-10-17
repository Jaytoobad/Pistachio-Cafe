import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById, updateOrderStatus, cancelOrder } from '../../services/admin';
import { formatMoney, formatAccra } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import PageLoader from '../../components/PageLoader';
import StatusPill from '../../components/StatusPill';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUS_ORDER = ['received', 'preparing', 'ready', 'completed'];

function toWhatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.startsWith('0') ? `233${digits.slice(1)}` : digits;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    setNotFound(false);
    fetchOrderById(id)
      .then((o) => { setOrder(o); })
      .catch((err) => {
        const missing = err?.code === 'PGRST116' || /0 rows/i.test(err?.message || '');
        if (missing) setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusRank = order ? STATUS_ORDER.indexOf(order.status) : -1;

  const handleSetStatus = async (next) => {
    if (next === order.status) return;
    setSaving(true);
    try {
      await updateOrderStatus(order.id, next);
      setOrder((o) => ({ ...o, status: next }));
    } catch (err) {
      showToast(err?.message || 'Could not update status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const doCancel = async () => {
    setSaving(true);
    try {
      await cancelOrder(order.id);
      setOrder((o) => ({ ...o, status: 'cancelled' }));
    } catch (err) {
      showToast(err?.message || 'Could not cancel order.', 'error');
    } finally {
      setSaving(false);
      setConfirmCancel(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div className="page"><div className="page-header"><h1>Order</h1></div>
        <p className="empty-state">Could not load this order. <button className="btn btn-outline" onClick={() => window.location.reload()}>Try again</button></p></div>
    );
  }
  if (notFound || !order) return <div className="page"><h1>Order not found</h1></div>;

  const backLink = `<a href="/admin/orders">&larr; Back to orders</a>`;
  const telLink = `tel:${order.phone}`;
  const waText = `Hi ${order.customer_name}, this is Pistachio Café about your order ${order.order_code}.`;
  const waLink = `https://wa.me/${toWhatsAppNumber(order.phone)}?text=${encodeURIComponent(waText)}`;

  const timeline = STATUS_ORDER.map((status, index) => ({
    status,
    done: index <= statusRank,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  const itemLines = (order.order_items || []).map((item) => (
    <tr key={item.id}>
      <td className="name">{item.name}</td>
      <td className="qty">{item.qty}</td>
      <td className="price">{formatMoney(item.unit_price)}</td>
    </tr>
  ));

  return (
    <div className="page order-detail-page">
      <div className="page-header">
        <div>
          <h1>Order {order.order_code}</h1>
          <p className="page-sub">Placed {formatAccra(order.created_at)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusPill status={order.status} />
          <StatusPill status={order.payment_status} />
          <button className="btn btn-outline btn-sm no-print" onClick={handlePrint}>Print ticket</button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel order?"
        message={`Cancel ${order.order_code}? This cannot be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep"
        onConfirm={doCancel}
        onCancel={() => setConfirmCancel(false)}
      />

      <div className="ticket">
        <div className="ticket-head">
          <h2>Pistachio Café</h2>
          <p>Spintex, Accra &bull; Elegance you can taste</p>
        </div>
          <p style={{ margin: 0 }}>Order {order.order_code}</p>
          <p style={{ margin: 0 }}>Placed {formatAccra(order.created_at)}</p>
          <p style={{ margin: 0 }}>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
        <hr />
        <table className="ticket-items">
          <tbody>
            {itemLines}
            {itemLines.length === 0 && <tr><td colSpan={3}>No items</td></tr>}
          </tbody>
        </table>
        <hr />
        <div className="ticket-total">
          Subtotal {formatMoney(order.subtotal)}&nbsp;
          {order.delivery_fee > 0 && (
            <>
              <br />
              Delivery {formatMoney(order.delivery_fee)}
            </>
          )}
          <br />Total {formatMoney(order.total)}
        </div>
        <div className="ticket-foot">
          {order.paystack_reference ? `Paid via Paystack &bull; Ref ${order.paystack_reference}` : 'Payment pending'}
          <br />
          {order.notes ? `Notes: ${order.notes}` : ''}
        </div>
      </div>

      <div className="order-meta">
        <div>
          <dt>Customer</dt>
          <dd>{order.customer_name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd><a href={`mailto:${order.email}`}>{order.email}</a></dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd><a href={telLink}>{order.phone}</a></dd>
        </div>
        <div>
          <dt>Fulfilment</dt>
          <dd>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</dd>
        </div>
        {order.fulfilment === 'delivery' && order.address && (
          <div>
            <dt>Address</dt>
            <dd>{order.address}</dd>
          </div>
        )}
        {order.notes && (
          <div>
            <dt>Notes</dt>
            <dd>{order.notes}</dd>
          </div>
        )}
        <div>
          <dt>Paystack reference</dt>
          <dd>{order.paystack_reference || '\u2014'}</dd>
        </div>
        {order.paid_at && (
          <div>
            <dt>Paid at</dt>
            <dd>{formatAccra(order.paid_at)}</dd>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Customer actions</h3>
        <div className="ticket-actions">
          <a href={telLink} className="btn btn-outline">Call {order.customer_name}</a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">WhatsApp</a>
        </div>
      </div>

       <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Status timeline</h3>
        <ul className="status-timeline">
          {timeline.map((step) => (
            <li key={step.status} className={step.done ? 'done' : 'todo'}>
              <div className="timeline-dot">{step.done ? '\u2713' : '&nbsp;'}</div>
              <span>{step.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {statusRank >= 0 && (
          <select
            value={order.status}
            onChange={(e) => handleSetStatus(e.target.value)}
            disabled={saving || order.status === 'completed' || order.status === 'cancelled'}
            className="btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {STATUS_ORDER.filter((s) => STATUS_ORDER.indexOf(s) > statusRank).map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmCancel(true)} disabled={saving}>
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}
