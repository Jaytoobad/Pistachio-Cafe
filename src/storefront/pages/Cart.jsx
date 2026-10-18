import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../data/products';
import { DELIVERY_ZONES, DEFAULT_DELIVERY_ZONE } from '../config';
import '../old-static.css';

export default function Cart() {
  const { items, updateQty, remove, subtotal, count } = useCart();
  const { showToast } = useToast();
  // PLACEHOLDER: delivery fee comes from the selected zone (default Spintex
  // GHS 15), not the old flat GHS 10.
  const [zoneId, setZoneId] = useState(DEFAULT_DELIVERY_ZONE.id);
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId) || DEFAULT_DELIVERY_ZONE;
  const deliveryFee = zone.fee;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  if (items.length === 0) {
    return (
      <div className="old-container">
        <main id="main">
          <section className="old-page-hero">
            <div className="old-container">
              <p className="old-page-hero-eyebrow">Almost there</p>
              <h1>Your cart</h1>
              <p>Double check what you're ordering, then head to checkout.</p>
            </div>
          </section>
          <section className="old-section">
            <div className="old-container">
              <div className="old-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet.</p>
                <Link to="/menu" className="old-btn old-btn-accent">Browse the menu</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="old-container">
      <main id="main">
        <section className="old-page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow">Almost there</p>
            <h1>Your cart</h1>
            <p>Double check what you're ordering, then head to checkout.</p>
          </div>
        </section>

        <section className="old-section">
          <div className="old-container">
            <div className="old-cart-layout">
              <div>
                <div data-cart-list>
                  {items.map((item) => (
                    <div key={item.dish_id} className="old-cart-item" data-item={item.dish_id}>
                      <div className="old-cart-item-media">
                        <img
                          src={item.image_url || '/images/placeholder-cup-pistachios.jpg'}
                          alt=""
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <div>
                        <p className="old-cart-item-name old-mt-0">{item.name}</p>
                        <p className="old-cart-item-cat old-mt-0">{formatMoney(item.price)} each</p>
                        <button
                          className="old-cart-item-remove"
                          onClick={() => {
                            remove(item.dish_id);
                            showToast('Item removed');
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="old-cart-item-right">
                        <span className="old-cart-item-total">{formatMoney(item.price * item.qty)}</span>
                        <div className="old-qty-stepper">
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
                            −
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
              </div>
              <aside className="old-summary-card" data-cart-summary>
                <h3>Order summary</h3>
                <div className="old-summary-row">
                  <span>Subtotal</span>
                  <span data-subtotal>{formatMoney(subtotal)}</span>
                </div>
                <div className="old-summary-row">
                  <span>Delivery / service fee</span>
                  <span data-delivery>{formatMoney(deliveryFee)}</span>
                </div>
                <div className="old-form-row" style={{ marginTop: '0.75rem' }}>
                  <label htmlFor="cart-zone">Delivery zone</label>
                  <select
                    id="cart-zone"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    style={{ padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}
                  >
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>{z.name} — {formatMoney(z.fee)}</option>
                    ))}
                  </select>
                </div>
                <div className="old-promo-row">
                  <input type="text" placeholder="Promo code" aria-label="Promo code" />
                  <button type="button" onClick={() => showToast('Promo codes coming soon')}>
                    Apply
                  </button>
                </div>
                <div className="old-summary-row total">
                  <span>Total</span>
                  <span data-total>{formatMoney(total)}</span>
                </div>
                <Link to="/checkout" className="old-btn old-btn-primary old-btn-block" style={{ marginTop: '1rem' }}>
                  Proceed to checkout
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}