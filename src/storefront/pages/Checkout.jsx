import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { createOrder, openPaystack, verifyPayment } from '../services/orders.index';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { BRAND, CURRENCY_SYMBOL } from '../config';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import SectionHeading from '../components/SectionHeading';

const PHONE_REGEX = /^(?:\+?233|0)?[1-9][0-9]{7,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();
  useDocumentTitle('Checkout | Pistachio Café');

  const deliveryFee = Number(settings?.delivery_fee || 0);
  const [form, setForm] = useState({ customer_name: '', phone: '', email: '', fulfilment: 'pickup', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const total = subtotal + (form.fulfilment === 'delivery' ? deliveryFee : 0);

  const validate = useCallback(() => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    else if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Ghana phone number (e.g. 024 123 4567).';
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (form.fulfilment === 'delivery' && !form.address.trim()) e.address = 'Address is required for delivery.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) { showToast('Your cart is empty.', 'error'); return; }
    setProcessing(true);
    try {
      const { order_code, reference } = await createOrder({
        items,
        customer_name: form.customer_name.trim(),
        phone: form.phone.replace(/\s/g, ''),
        email: form.email.trim() || undefined,
        fulfilment: form.fulfilment,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
        delivery_fee: form.fulfilment === 'delivery' ? deliveryFee : 0,
      });
      await openPaystack({
        reference,
        amount: total,
        email: form.email.trim(),
        onSuccess: async (ref) => {
          try {
            await verifyPayment(ref);
            clear();
            navigate(`/track/${order_code}`);
          } catch (err) {
            showToast(err?.message || 'Payment could not be verified right now.', 'error');
            setProcessing(false);
          }
        },
        onClose: () => {
          setProcessing(false);
          showToast('Payment was closed before completion. Your order is still pending — you can pay again later.');
        },
      });
    } catch (err) {
      setProcessing(false);
      showToast(err?.message || 'Could not place your order. Try again.', 'error');
    }
  };

  return (
    <div className="sf-container">
      {items.length === 0 ? (
        <section className="sf-section" style={{ textAlign: 'center', paddingTop: 80 }}>
          <h1>Your cart is empty</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 12, maxWidth: 'min(38ch, 90vw)', marginInline: 'auto' }}>Add something from the menu before checking out.</p>
          <div style={{ marginTop: 28 }}><Link to="/menu" className="sf-btn sf-btn-primary">Browse the menu</Link></div>
        </section>
      ) : (
        <form onSubmit={handlePay}>
          <SectionHeading title="Check out" subtitle="Review your order and pay" />
          <div className="sf-checkout-page">
            <div className="sf-form">
              <h2>Your details</h2>
              <p className="sf-form-sub">We will use this to confirm your order.</p>

              <div className="sf-field">
                <label htmlFor="checkout-name">Full name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input id="checkout-name" required value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
                {errors.customer_name && <span className="sf-field-error">{errors.customer_name}</span>}
              </div>

              <div className="sf-field">
                <label htmlFor="checkout-phone">Phone <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input id="checkout-phone" type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="024 123 4567" />
                {errors.phone && <span className="sf-field-error">{errors.phone}</span>}
                <span className="sf-field-hint">Ghana mobile number. TODO: confirm the number format with the owner.</span>
              </div>

              <div className="sf-field">
                <label htmlFor="checkout-email">Email (optional)</label>
                <input id="checkout-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                {errors.email && <span className="sf-field-error">{errors.email}</span>}
              </div>

              <h3 style={{ margin: '24px 0 10px', fontSize: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>How would you like to receive your order?</h3>
              <div className="sf-fulfilment">
                <label className={form.fulfilment === 'pickup' ? 'sf-checked' : ''}>
                  <input type="radio" name="fulfilment" value="pickup" checked={form.fulfilment === 'pickup'} onChange={(e) => setForm((f) => ({ ...f, fulfilment: e.target.value }))} />
                  Pickup — free
                </label>
                <label className={form.fulfilment === 'delivery' ? 'sf-checked' : ''}>
                  <input type="radio" name="fulfilment" value="delivery" checked={form.fulfilment === 'delivery'} onChange={(e) => setForm((f) => ({ ...f, fulfilment: e.target.value }))} />
                  Delivery — {formatMoney(deliveryFee)}
                </label>
              </div>

              {form.fulfilment === 'delivery' && (
                <div className="sf-field">
                  <label htmlFor="checkout-address">Delivery address <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input id="checkout-address" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, area, city" />
                  {errors.address && <span className="sf-field-error">{errors.address}</span>}
                </div>
              )}

              <div className="sf-field">
                <label htmlFor="checkout-notes">Order notes</label>
                <textarea id="checkout-notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Anything we should know?" />
                <span className="sf-field-hint">e.g. allergy information or a gate code.</span>
              </div>

              <button type="submit" className="sf-btn sf-btn-primary sf-btn-block sf-checkout-desktop-pay" disabled={processing} style={{ marginTop: 8 }} aria-label="Pay now">
                {processing ? 'Placing order…' : 'Pay now'}
              </button>
            </div>

            <aside className="sf-cart-summary">
              <h3>Order summary</h3>
              {items.map((item) => (
                <div className="sf-summary-row" key={item.dish_id} style={{ fontSize: '0.88rem' }}>
                  <span>{item.qty}× {item.name}</span>
                  <span>{formatMoney(Number(item.price) * item.qty)}</span>
                </div>
              ))}
              <div className="sf-summary-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {form.fulfilment === 'delivery' && (
                <div className="sf-summary-row">
                  <span>Delivery</span>
                  <span>{formatMoney(deliveryFee)}</span>
                </div>
              )}
              <div className="sf-summary-row total">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <p className="sf-field-hint" style={{ margin: '16px 0 0' }}>
                Amounts are in {CURRENCY_SYMBOL} (Ghana cedis). The final total is confirmed by our system before payment.
              </p>
              <button type="submit" className="sf-btn sf-btn-primary sf-btn-block" disabled={processing} style={{ marginTop: 16 }} aria-label="Pay now">
                {processing ? 'Placing order…' : 'Pay now'}
              </button>
            </aside>
          </div>

          <div className="sf-checkout-sticky-pay">
            <div className="sf-sticky-pay-inner">
              <div className="sf-sticky-pay-total">
                Total: {formatMoney(total)}
              </div>
              <button type="submit" className="sf-btn sf-btn-primary" disabled={processing} aria-label="Pay now">
                {processing ? 'Placing order…' : 'Pay now'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
