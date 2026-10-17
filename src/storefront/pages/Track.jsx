import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { trackOrder } from '../services/tracking.index';
import { TRACK_STATUSES } from '../config';
import Stepper from '../components/Stepper';
import StatusPill from '../../lib/components/StatusPill';
import { formatMoney, formatAccra } from '../../lib/format';

const POLL_MS = 12000; // poll every 10-15 seconds; customer side never uses realtime.

export default function Track() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');

  const load = useCallback((lookupCode, lookupPhone) => {
    let active = true;
    setLoading(true);
    setError(null);
    trackOrder(lookupCode, lookupPhone)
      .then((data) => { if (active) setOrder(data ?? null); })
      .catch(() => { if (active) setError('Could not look up this order. Try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!code) return;
    const storedPhone = localStorage.getItem(`pistachio:track:${code}`) || '';
    setPhone(storedPhone);
    return load(code, storedPhone);
  }, [code, load]);

  // Poll the order every 10-15 seconds while it is active.
  useEffect(() => {
    if (!code || !order) return;
    if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'delivered') return;
    const id = setInterval(() => {
      load(code, phone);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [code, order, phone, load]);

  const handleSearch = (e) => {
    e.preventDefault();
    const c = String(input || '').trim();
    const p = String(phone || '').trim();
    if (!c) return;
    localStorage.setItem(`pistachio:track:${c}`, p);
    navigate(`/track/${encodeURIComponent(c)}`);
  };

  const renderSearch = () => (
    <section className="sf-section" style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1>Track your order</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 12, maxWidth: '40ch', marginInline: 'auto' }}>Enter your order code (e.g. PI-123456) and phone number to see its status.</p>
      <form onSubmit={handleSearch} style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input id="track-code" required value={input} onChange={(e) => setInput(e.target.value)} placeholder="Order code" style={{ width: 140, maxWidth: '100%' }} />
        <input id="track-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={{ width: 160, maxWidth: '100%' }} />
        <button type="submit" className="sf-btn sf-btn-primary">Track</button>
      </form>
    </section>
  );

  if (!code) return renderSearch();

  if (loading) {
    return (
      <div className="sf-container">
        <div className="sf-loading"><div className="sf-spinner" aria-label="Loading" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="sf-container">
        {renderSearch()}
        <section className="sf-section" style={{ textAlign: 'center', marginTop: 32 }}>
          <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px' }}>Order not found</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4, maxWidth: '40ch', marginInline: 'auto' }}>We could not find an order with that code. Check your confirmation message and try again.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="sf-container">
      <section className="sf-section">
        <div className="sf-section-head">
          <div>
            <h1>Order {order.order_code}</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Placed {formatAccra(order.created_at)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusPill status={order.status} />
            <StatusPill status={order.payment_status} />
          </div>
        </div>

        <Stepper currentStatus={order.status} />

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Total</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)' }}>{formatMoney(Number(order.total || 0))}</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Fulfilment</h3>
            <p style={{ margin: 0 }}>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Customer</h3>
            <p style={{ margin: 0 }}>{order.customer_name || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</p>
          </div>
          {order.estimated_minutes && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>Est. ready</h3>
              <p style={{ margin: 0 }}>{order.estimated_minutes} min</p>
            </div>
          )}
        </div>

        {order.fulfilment === 'delivery' && (
          <div style={{ marginTop: 16 }}>
            {order.address && <p style={{ margin: '0 0 4px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}><strong>Address:</strong> {order.address}</p>}
            {order.landmark && <p style={{margin:"0 0 4px", color:"var(--color-text-muted)", fontSize:"0.85rem"}}><strong>Landmark:</strong> {order.landmark}</p>}
            {order.rider && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <strong>Rider:</strong> {order.rider.name}{order.rider.phone ? ` � ${order.rider.phone}` : ""}
              </p>
            )}
          </div>
        )}

        {order.fulfilment !== 'delivery' && order.rider && (
          <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}><strong>Rider:</strong> {order.rider.name}{order.rider.phone ? ` ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${order.rider.phone}` : ''}</p>
        )}

        {order.items && order.items.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Items</h3>
            <ul className="sf-order-items" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{item.quantity} � {item.name}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatMoney(Number(item.subtotal || 0))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {order.history && order.history.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Order history</h3>
            <ul className="sf-order-history" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.history.map((h, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  <span><StatusPill status={h.status} /></span>
                  <span>{formatAccra(h.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
