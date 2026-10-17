import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { trackOrder } from '../services/tracking';
import { TRACK_STATUSES } from '../config';
import Stepper from '../components/Stepper';
import StatusPill from '../../components/StatusPill';
import { formatMoney, formatAccra } from '../../lib/format';

export default function Track() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!code) return;
    let active = true;
    setLoading(true);
    setError(null);
    trackOrder(code)
      .then((data) => { if (active) setOrder(data ?? null); })
      .catch(() => { if (active) setError('Could not look up this order. Try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [code]);

  const handleSearch = (e) => {
    e.preventDefault();
    const c = String(input || '').trim();
    if (!c) return;
    navigate(`/track/${encodeURIComponent(c)}`);
  };

  const renderSearch = () => (
    <section className="sf-section" style={{ textAlign: 'center', paddingTop: 60 }}>
      <h1>Track your order</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 12, maxWidth: '40ch', marginInline: 'auto' }}>Enter your order code (e.g. PSC-20261017-421) to see its status.</p>
      <form onSubmit={handleSearch} style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input id="track-code" required value={input} onChange={(e) => setInput(e.target.value)} placeholder="Order code" style={{ width: 100, maxWidth: '100%' }} />
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
            <p style={{ margin: 0 }}>{order.customer_name || '—'}</p>
          </div>
        </div>

        {order.fulfilment === 'delivery' && (
          <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>We will deliver to the address you provided at checkout. Pay on collection if you chose pay on delivery.</p>
        )}
      </section>
    </div>
  );
}
