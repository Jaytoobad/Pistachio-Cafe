import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { trackOrder } from '../services/tracking.index';
import Stepper from '../components/Stepper';
import StatusPill from '../../lib/components/StatusPill';
import { formatMoney, formatAccra } from '../../lib/format';
import { TRACK_ORDER_PAGE } from '../data/content';

const POLL_MS = 12000;

export default function Track() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(Boolean(code));
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const requestIdRef = useRef(0);
  useDocumentTitle('Track Order | Pistachio Caf\u00e9');

  const load = useCallback(async (lookupCode, lookupPhone, { showLoading = false, manual = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (showLoading) setLoading(true);
    if (manual) setRefreshing(true);
    setError(null);
    try {
      const data = await trackOrder(lookupCode, lookupPhone);
      if (requestId !== requestIdRef.current) return;
      setOrder(data ?? null);
      setLastChecked(new Date().toISOString());
    } catch {
      if (requestId === requestIdRef.current) {
        setError(showLoading ? TRACK_ORDER_PAGE.lookupError : TRACK_ORDER_PAGE.refreshError);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!code) return;
    const storedPhone = localStorage.getItem(`pistachio:track:${code}`) || '';
    setPhone(storedPhone);
    setInput(code);
    load(code, storedPhone, { showLoading: true });
    return () => { requestIdRef.current += 1; };
  }, [code, load]);

  useEffect(() => {
    if (!code || !order) return;
    if (order.status === 'completed' || order.status === 'cancelled' || order.status === 'delivered') return;
    const id = setInterval(() => {
      load(code, phone);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [code, order?.status, phone, load]);

  const handleSearch = (e) => {
    e.preventDefault();
    const c = String(input || '').trim();
    const p = String(phone || '').trim();
    if (!c) return;
    localStorage.setItem(`pistachio:track:${c}`, p);
    navigate(`/track/${encodeURIComponent(c)}`);
  };

  const handleRefresh = () => {
    load(code, phone, { manual: true });
  };

  const guidance = order?.status === 'ready'
    ? (order.fulfilment === 'delivery' ? TRACK_ORDER_PAGE.guidance.readyDelivery : TRACK_ORDER_PAGE.guidance.readyPickup)
    : ({
      received: TRACK_ORDER_PAGE.guidance.received,
      confirmed: TRACK_ORDER_PAGE.guidance.confirmed,
      preparing: TRACK_ORDER_PAGE.guidance.preparing,
      out_for_delivery: TRACK_ORDER_PAGE.guidance.outForDelivery,
      delivered: TRACK_ORDER_PAGE.guidance.delivered,
      completed: TRACK_ORDER_PAGE.guidance.completed,
      cancelled: TRACK_ORDER_PAGE.guidance.cancelled,
    }[order?.status] || TRACK_ORDER_PAGE.guidance.default);

  const renderSearch = () => (
    <section className="track-landing">
      <div className="track-intro">
        <p className="sf-hero-eyebrow">{TRACK_ORDER_PAGE.eyebrow}</p>
        <h1 className="text-charcoal font-serif">{TRACK_ORDER_PAGE.heading}</h1>
        <p className="text-muted text-sm">{TRACK_ORDER_PAGE.intro}</p>
        <svg className="track-illustration" width="240" height="180" viewBox="0 0 240 180" fill="none" aria-hidden="true">
          <path d="M66 51h89v105H66z" fill="var(--color-cream)" stroke="var(--color-border)" strokeWidth="2" />
          <path d="M82 75h56M82 90h41M82 120h47" stroke="var(--color-border)" strokeWidth="4" strokeLinecap="round" />
          <path d="M155 66h13l-6.5 9zM155 87h13l-6.5 9zM155 108h13l-6.5 9zM155 129h13l-6.5 9z" fill="var(--color-bg)" />
          <path d="M29 111h125v28a15 15 0 0 1-15 15H44a15 15 0 0 1-15-15z" fill="var(--color-surface)" stroke="var(--color-sage)" strokeWidth="3" />
          <path d="M154 117h19a18 18 0 0 1 0 36h-27" stroke="var(--color-sage)" strokeWidth="6" strokeLinecap="round" />
          <path d="M67 98c-5-8 5-11 0-19M91 98c-5-8 5-11 0-19M115 98c-5-8 5-11 0-19" stroke="var(--color-ochre)" strokeWidth="3" strokeLinecap="round" />
          <path d="M31 122h121" stroke="var(--color-cream-dim)" strokeWidth="3" />
        </svg>
      </div>
      <form className="track-form" onSubmit={handleSearch}>
        <label htmlFor="track-code">{TRACK_ORDER_PAGE.codeLabel}</label>
        <input id="track-code" required value={input} onChange={(e) => setInput(e.target.value)} placeholder={TRACK_ORDER_PAGE.codePlaceholder} autoComplete="off" />
        <p className="track-field-hint">{TRACK_ORDER_PAGE.codeHint}</p>
        <label htmlFor="track-phone">{TRACK_ORDER_PAGE.phoneLabel}</label>
        <input id="track-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={TRACK_ORDER_PAGE.phonePlaceholder} type="tel" autoComplete="tel" />
        <p className="track-field-hint">{TRACK_ORDER_PAGE.privacyNote}</p>
        <button type="submit" className="btn-cafe btn-cafe-primary">{TRACK_ORDER_PAGE.submit}</button>
      </form>
    </section>
  );

  if (!code) return <div className="sf-container min-h-dvh px-4 py-6"><div className="track-page">{renderSearch()}</div></div>;

  if (loading && !order) {
    return (
      <div className="sf-container min-h-dvh px-4 py-6">
        <div className="track-loading" role="status">
          <div className="sf-spinner" aria-hidden="true" />
          <p>{TRACK_ORDER_PAGE.checking}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="sf-container min-h-dvh px-4 py-6">
        {renderSearch()}
        <section className="track-not-found" role="status">
          <h2 className="text-charcoal font-serif">{error ? TRACK_ORDER_PAGE.checkErrorHeading : TRACK_ORDER_PAGE.notFoundHeading}</h2>
          <p className="text-muted text-sm">{error || TRACK_ORDER_PAGE.notFound}</p>
          {error && <button type="button" className="btn-cafe btn-cafe-outline" onClick={() => load(code, phone, { showLoading: true })}>{TRACK_ORDER_PAGE.tryAgain}</button>}
        </section>
      </div>
    );
  }

  return (
    <div className="sf-container min-h-dvh px-4 py-6">
      <section className="sf-section">
        <div className="sf-section-head">
          <div>
            <h1 className="text-charcoal font-serif">Order {order.order_code}</h1>
            <p className="text-muted text-sm" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Placed {formatAccra(order.created_at)}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusPill status={order.status} />
            <StatusPill status={order.payment_status} />
          </div>
        </div>

        <Stepper currentStatus={order.status} />

        <div className="track-update-panel" aria-live="polite" aria-atomic="true">
          <div className="track-update-copy">
            <h2>{TRACK_ORDER_PAGE.nextHeading}</h2>
            <p>{guidance}</p>
            <p className="track-last-checked">
              {lastChecked
                ? `${TRACK_ORDER_PAGE.lastChecked} ${formatAccra(lastChecked, { hour: 'numeric', minute: '2-digit' })}`
                : TRACK_ORDER_PAGE.checking}
              {!['completed', 'cancelled', 'delivered'].includes(order.status) && ` \u00b7 ${TRACK_ORDER_PAGE.autoRefresh}`}
            </p>
          </div>
          <button type="button" className="track-refresh" onClick={handleRefresh} disabled={refreshing} aria-label={refreshing ? TRACK_ORDER_PAGE.refreshing : TRACK_ORDER_PAGE.refresh}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 7v5h-5M4 17v-5h5" />
              <path d="M5.5 9a7 7 0 0 1 11.6-2L20 12M4 12l2.9 5a7 7 0 0 0 11.6-2" />
            </svg>
            <span>{refreshing ? TRACK_ORDER_PAGE.refreshing : TRACK_ORDER_PAGE.refresh}</span>
          </button>
          {error && <p className="track-refresh-error" role="alert">{error}</p>}
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>Total</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>{formatMoney(Number(order.total || 0))}</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>Fulfilment</h3>
            <p style={{ margin: 0 }}>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>Customer</h3>
            <p style={{ margin: 0 }}>{order.customer_name || '\u2014'}</p>
          </div>
          {order.estimated_minutes && (
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)' }}>Est. ready</h3>
              <p style={{ margin: 0 }}>{order.estimated_minutes} min</p>
            </div>
          )}
        </div>

        {order.fulfilment === 'delivery' && (
          <div style={{ marginTop: 16 }}>
            {order.address && <p style={{ margin: '0 0 4px', color: 'var(--color-muted)', fontSize: '0.85rem' }}><strong className="text-charcoal">Address:</strong> {order.address}</p>}
            {order.landmark && <p style={{ margin: '0 0 4px', color: 'var(--color-muted)', fontSize: '0.85rem' }}><strong className="text-charcoal">Landmark:</strong> {order.landmark}</p>}
            {order.rider && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                <strong className="text-charcoal">Rider:</strong> {order.rider.name}{order.rider.phone ? ` \u2014 ${order.rider.phone}` : ''}
              </p>
            )}
          </div>
        )}

        {order.fulfilment !== 'delivery' && order.rider && (
          <p style={{ marginTop: 16, color: 'var(--color-muted)', fontSize: '0.85rem' }}><strong className="text-charcoal">Rider:</strong> {order.rider.name}{order.rider.phone ? ` \u2014 ${order.rider.phone}` : ''}</p>
        )}

        {order.items && order.items.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Items</h3>
            <ul className="sf-order-items" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{item.quantity} &times; {item.name}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{formatMoney(Number(item.subtotal || 0))}</span>
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
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
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
