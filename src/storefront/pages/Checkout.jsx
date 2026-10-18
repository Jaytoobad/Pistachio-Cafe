import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder, openPaystack, verifyPayment } from '../services/orders.index';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../data/products';
import { DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE, getDeliveryZone } from '../config';
import '../../styles/storefront.css';

const PHONE_REGEX = /^(?:\+?233|0)?[1-9][0-9]{7,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ORDER_STEPS = ['Received', 'Preparing', 'Ready', 'Completed'];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: '', phone: '', email: '', fulfilment: 'pickup',
    address: '', landmark: '', notes: '', zone: DEFAULT_DELIVERY_ZONE.id,
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [trackerStatus, setTrackerStatus] = useState(0);
  const formRef = useRef(null);
  const payBtnRef = useRef(null);

  const zone = getDeliveryZone(form.zone);
  const deliveryFee = form.fulfilment === 'delivery' ? zone.fee : 0;
  const total = subtotal + deliveryFee;

  const validate = useCallback(() => {
    const e = {};
    if (!form.fullname.trim()) e.fullname = 'Full name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number.';
    if (!form.email.trim()) e.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.fulfilment === 'delivery' && !form.address.trim()) e.address = 'Delivery address is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) { showToast('Your cart is empty'); return; }

    setProcessing(true);
    try {
      const { order_code, reference } = await createOrder({
        items,
        customer_name: form.fullname.trim(),
        phone: form.phone.replace(/\s/g, ''),
        email: form.email.trim() || undefined,
        fulfilment: form.fulfilment,
        address: form.address.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        notes: form.notes.trim() || undefined,
        delivery_fee: form.fulfilment === 'delivery' ? deliveryFee : 0,
      });

      if (typeof PaystackPop !== 'undefined' && reference) {
        const handler = PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
          email: form.email.trim(),
          amount: Math.round(total * 100),
          currency: 'GHS',
          metadata: { custom_fields: [{ display_name: 'Customer name', variable_name: 'customer_name', value: form.fullname.trim() }] },
          callback: async (response) => {
            try {
              await verifyPayment(response.reference);
              completeOrder(form.fullname.trim(), form.email.trim(), form.phone.replace(/\s/g, ''), order_code);
            } catch (err) {
              showToast(err?.message || 'Payment could not be verified right now.');
              setProcessing(false);
            }
          },
          onClose: () => {
            setProcessing(false);
            showToast('Payment was closed before completion. Your order is still pending.');
          }
        });
        handler.openIframe();
      } else {
        payBtnRef.current.disabled = true;
        payBtnRef.current.textContent = 'Processing payment…';
        setTimeout(() => {
          completeOrder(form.fullname.trim(), form.email.trim(), form.phone.replace(/\s/g, ''), order_code);
        }, 1400);
      }
    } catch (err) {
      setProcessing(false);
      showToast(err?.message || 'Could not place your order. Try again.');
    }
  };

  const completeOrder = (name, email, phone, code) => {
    const order = {
      id: code,
      name, email, phone,
      items,
      total: subtotal + deliveryFee,
      placedAt: Date.now(),
      status: 0
    };

    const orders = JSON.parse(localStorage.getItem('pistachio_orders') || '{}');
    orders[code] = order;
    localStorage.setItem('pistachio_orders', JSON.stringify(orders));

    clear();
    setOrderId(code);
    setTrackerStatus(0);
    simulateProgress(code);
  };

  const renderSteps = (status) => {
    return ORDER_STEPS.map((label, i) => (
      <div key={label} className={`old-step ${i < status ? 'is-done' : i === status ? 'is-current' : ''}`}>
        <div className="old-step-dot">{i < status ? '✓' : i + 1}</div>
        <div className="old-step-label">{label}</div>
      </div>
    ));
  };

  const simulateProgress = (code) => {
    if (!orderId || trackerStatus >= ORDER_STEPS.length - 1) return;
    const interval = setInterval(() => {
      setTrackerStatus((prev) => {
        if (prev >= ORDER_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        const orders = JSON.parse(localStorage.getItem('pistachio_orders') || '{}');
        const order = orders[orderId];
        if (!order) {
          clearInterval(interval);
          return prev;
        }
        order.status = prev + 1;
        orders[orderId] = order;
        localStorage.setItem('pistachio_orders', JSON.stringify(orders));
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  };

  const initOrderLookup = () => {
    const formEl = document.querySelector('[data-lookup-form]');
    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = formEl.querySelector('input');
        const id = input.value.trim().toUpperCase();
        const orders = JSON.parse(localStorage.getItem('pistachio_orders') || '{}');
        if (orders[id]) {
          formRef.current.style.display = 'none';
          setOrderId(id);
          const stored = orders[id];
          setTrackerStatus(stored.status || 0);
        } else {
          showToast('No order found with that ID on this device');
        }
      });
    }
  };

  useEffect(() => {
    initOrderLookup();
  }, []);

  return (
    <div className="old-container min-h-dvh px-4 py-6">
      <main id="main">
        <section className="old-page-hero page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow page-hero-eyebrow text-muted">Last step</p>
            <h1 className="page-hero-title text-charcoal font-serif">Checkout &amp; order tracking</h1>
            <p className="page-hero-desc text-muted">Pay securely with Paystack, then watch your order move from kitchen to counter in real time.</p>
          </div>
        </section>

        <section className="old-section py-6">
          <div className="old-container">
            <div ref={formRef} data-checkout-form-wrap>
              <form onSubmit={handlePay} data-checkout-form>
                <div className="old-checkout-section checkout-section">
                  <h3 className="text-charcoal font-serif">Your details</h3>
                  <div className="old-form-grid-2 form-grid-2">
                    <div className="old-form-row form-row">
                      <label htmlFor="fullname" className="block text-xs text-muted uppercase tracking-wider mb-1">Full name</label>
                      <input type="text" id="fullname" name="fullname" required value={form.fullname} onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                      {errors.fullname && <span className="block text-xs" style={{ color: '#A8434B', marginTop: '4px' }}>{errors.fullname}</span>}
                    </div>
                    <div className="old-form-row form-row">
                      <label htmlFor="phone" className="block text-xs text-muted uppercase tracking-wider mb-1">Phone number</label>
                      <input type="tel" id="phone" name="phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                      {errors.phone && <span className="block text-xs" style={{ color: '#A8434B', marginTop: '4px' }}>{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="old-form-row form-row">
                    <label htmlFor="email" className="block text-xs text-muted uppercase tracking-wider mb-1">Email address</label>
                    <input type="email" id="email" name="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                    {errors.email && <span className="block text-xs" style={{ color: '#A8434B', marginTop: '4px' }}>{errors.email}</span>}
                  </div>
                </div>

                <div className="old-checkout-section checkout-section">
                  <h3 className="text-charcoal font-serif">Pickup or delivery?</h3>
                  <div className="old-fulfil-toggle fulfil-toggle" style={{ gap: '0.5rem' }}>
                    <button
                      type="button"
                      data-fulfil="pickup"
                      aria-pressed={form.fulfilment === 'pickup'}
                      className={form.fulfilment === 'pickup' ? 'btn-cafe btn-cafe-primary' : 'btn-cafe btn-cafe-outline btn-cafe-sm'}
                      onClick={() => { setForm((f) => ({ ...f, fulfilment: 'pickup' })); }}
                    >
                      Pickup in store
                    </button>
                    <button
                      type="button"
                      data-fulfil="delivery"
                      aria-pressed={form.fulfilment === 'delivery'}
                      className={form.fulfilment === 'delivery' ? 'btn-cafe btn-cafe-primary' : 'btn-cafe btn-cafe-outline btn-cafe-sm'}
                      onClick={() => { setForm((f) => ({ ...f, fulfilment: 'delivery' })); }}
                    >
                      Delivery
                    </button>
                  </div>
                  {form.fulfilment === 'delivery' && (
                    <>
                      <div className="old-form-row form-row">
                        <label htmlFor="address" className="block text-xs text-muted uppercase tracking-wider mb-1">Delivery address</label>
                        <textarea id="address" name="address" rows="2" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                        {errors.address && <span className="block text-xs" style={{ color: '#A8434B', marginTop: '4px' }}>{errors.address}</span>}
                      </div>
                      <div className="old-form-row form-row">
                        <label htmlFor="landmark" className="block text-xs text-muted uppercase tracking-wider mb-1">Landmark (optional)</label>
                        <input type="text" id="landmark" name="landmark" placeholder="e.g. near the Shell station" value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                      </div>
                      <div className="old-form-row form-row">
                        <label htmlFor="zone" className="block text-xs text-muted uppercase tracking-wider mb-1">Delivery zone</label>
                        <select
                          id="zone"
                          name="zone"
                          value={form.zone}
                          onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                          className="w-full"
                          style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }}
                        >
                          {DELIVERY_ZONES.map((z) => (
                            <option key={z.id} value={z.id}>{z.name} — {formatMoney(z.fee)}</option>
                          ))}
                        </select>
                        <span className="block text-xs text-muted" style={{ marginTop: '4px' }}>
                          PLACEHOLDER: fee comes from the selected zone (default Spintex GHS 15).
                        </span>
                      </div>
                    </>
                  )}
                  <div className="old-form-row form-row">
                    <label htmlFor="notes" className="block text-xs text-muted uppercase tracking-wider mb-1">Order notes (optional)</label>
                    <textarea id="notes" name="notes" rows="2" placeholder="Allergies, extra napkins, anything we should know" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div className="old-checkout-section checkout-section">
                  <h3 className="text-charcoal font-serif">Payment</h3>
                  <p className="text-muted text-sm">You'll be securely redirected to Paystack to complete payment by card, mobile money, or bank transfer.</p>
                  <button
                    type="submit"
                    className="old-btn old-btn-accent old-btn-block btn-cafe btn-cafe-primary"
                    data-pay-btn
                    ref={payBtnRef}
                    disabled={processing}
                  >
                    {processing ? 'Processing payment…' : 'Pay now'}
                  </button>
                  <div className="old-pay-note pay-note" style={{ marginTop: '1rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '0.1rem' }}>
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-muted text-sm">Payments are processed by Paystack. Pistachio never sees or stores your card details.</span>
                  </div>
                </div>
              </form>
            </div>

            <aside className="order-summary-wrap" style={{ marginTop: '1.5rem' }}>
              <div className="old-summary-card cart-summary" data-checkout-summary-wrap>
                <h3 className="text-charcoal font-serif">Order summary</h3>
                <div data-checkout-summary>
                  {items.length === 0 ? (
                    <p>Your cart is empty. <Link to="/menu">Browse the menu</Link> to add something delicious first.</p>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={item.dish_id} className="old-order-line order-line">
                          <span className="text-muted">{item.qty} × {item.name}</span>
                          <span className="text-charcoal">{formatMoney(item.price * item.qty)}</span>
                        </div>
                      ))}
                      <div className="old-order-line order-line order-line-total" style={{ fontWeight: 700, borderTop: '1px solid #E1D7BD', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                        <span className="text-charcoal">Total due</span>
                        <span data-checkout-total className="text-charcoal">{formatMoney(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {orderId ? (
                <div className="old-summary-card old-tracker is-active" style={{ position: 'static', marginTop: '1.5rem' }} data-tracker>
                  <h3 className="text-charcoal font-serif">Order tracking</h3>
                  <p className="old-tracker-id text-charcoal">Order <strong data-order-id>{orderId}</strong></p>
                  <div className="old-steps" data-steps>
                    {renderSteps(trackerStatus)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '1.5rem' }}>We'll text you when it's ready. Thanks for ordering with us!</p>
                </div>
              ) : (
                <div className="old-summary-card old-tracker" style={{ position: 'static', marginTop: '1.5rem' }} data-tracker>
                  <h3 className="text-charcoal font-serif">Order tracking</h3>
                  <p className="old-tracker-id text-muted">Order <strong data-order-id>—</strong></p>
                  <div className="old-steps" data-steps>
                    {renderSteps(0)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '1.5rem' }}>We'll text you when it's ready. Thanks for ordering with us!</p>
                </div>
              )}

              <div className="old-summary-card" style={{ position: 'static', marginTop: '1.5rem' }}>
                <h3 className="text-charcoal font-serif">Track an existing order</h3>
                <form className="old-lookup-row lookup-row" data-lookup-form style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label htmlFor="lookup-id" className="old-skip-link" style={{ display: 'none' }}>Order ID</label>
                  <input type="text" id="lookup-id" placeholder="e.g. PI482913" required className="flex-1" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }} />
                  <button type="submit" className="old-btn old-btn-outline btn-cafe btn-cafe-outline btn-cafe-sm">Track</button>
                </form>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
