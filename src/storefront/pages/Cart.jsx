import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../data/products';
import { DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE } from '../config';
import SafeImg from '../components/SafeImg';

export default function Cart() {
  const { items, updateQty, remove, subtotal, count } = useCart();
  const { showToast } = useToast();
  const [zoneId, setZoneId] = useState(DEFAULT_DELIVERY_ZONE.id);
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId) || DEFAULT_DELIVERY_ZONE;
  const deliveryFee = zone.fee;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="container min-h-dvh py-6">
        <div>
          <section className="page-hero">
            <div className="container">
              <p className="page-hero-eyebrow text-muted">Almost there</p>
              <h1 className="page-hero-title text-charcoal font-serif">Your cart</h1>
              <p className="page-hero-desc text-muted">Double check what you're ordering, then head to checkout.</p>
            </div>
          </section>
          <section className="section">
            <div className="container">
              <div className="empty-state" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--color-muted)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ width: '56px', height: '56px', margin: '0 auto 1.25rem', color: 'var(--color-border)' }}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <h3 className="text-charcoal font-serif">Your cart is empty</h3>
                <p className="text-muted">Looks like you haven't added anything yet.</p>
                <Link to="/menu" className="btn btn-accent btn-cafe btn-cafe-primary">Browse the menu</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-dvh py-6">
      <div>
        <section className="page-hero">
          <div className="container">
            <p className="page-hero-eyebrow text-muted">Almost there</p>
            <h1 className="page-hero-title text-charcoal font-serif">Your cart</h1>
            <p className="page-hero-desc text-muted">Double check what you're ordering, then head to checkout.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div data-cart-list>
              {items.map((item) => (
                <div key={item.dish_id} className="cart-item" data-item={item.dish_id}>
                  <div className="cart-item-media aspect-square overflow-hidden rounded-t-xl">
                    <SafeImg
                      src={item.image_url}
                      label={item.name}
                      loading="lazy"
                      data-name={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="cart-item-name mt-0 text-charcoal font-semibold">{item.name}</p>
                    <p className="cart-item-cat mt-0 text-muted text-xs">{formatMoney(item.price)} each</p>
                    <button
                      className="cart-item-remove text-muted"
                      onClick={() => {
                        remove(item.dish_id);
                        showToast('Item removed');
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-total text-charcoal font-bold">{formatMoney(item.price * item.qty)}</span>
                    <div className="micro-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => {
                          if (item.qty <= 1) {
                            remove(item.dish_id);
                          } else {
                            updateQty(item.dish_id, item.qty - 1);
                          }
                        }}
                      >
                        &minus;
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.dish_id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="summary-card summary-card" data-summary-card style={{ position: 'static', marginTop: '1.5rem' }}>
              <h3 className="text-charcoal font-serif">Order summary</h3>
              <div className="summary-row">
                <span className="text-muted">Subtotal</span>
                <span data-subtotal className="text-charcoal">{formatMoney(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="text-muted">Delivery / service fee</span>
                <span data-delivery className="text-charcoal">{formatMoney(deliveryFee)}</span>
              </div>
              <div className="form-row" style={{ marginTop: '0.75rem' }}>
                <label htmlFor="cart-zone" className="text-xs text-muted uppercase tracking-wider">Delivery zone</label>
                <select
                  id="cart-zone"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full"
                  style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.875rem' }}
                >
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.name} &mdash; {formatMoney(z.fee)}</option>
                  ))}
                </select>
              </div>
              <div className="summary-row total summary-row-total">
                <span className="text-charcoal font-bold">Total</span>
                <span data-total className="text-charcoal font-bold">{formatMoney(total)}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-block btn-cafe btn-cafe-primary" style={{ marginTop: '1rem' }}>
                Proceed to checkout
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
