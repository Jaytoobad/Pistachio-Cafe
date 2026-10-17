import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../../lib/format';

export default function Cart() {
  const { items, updateQty, remove, subtotal, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="sf-container">
        <section className="sf-section" style={{ textAlign: 'center', paddingTop: 80 }}>
          <h1 style={{ fontSize: '2rem' }}>Your cart is empty</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 12, maxWidth: '38ch', marginInline: 'auto' }}>
            Browse the menu and add something delicious. Pickup is free and orders are ready in about 20 minutes.
          </p>
          <div style={{ marginTop: 28 }}>
            <Link to="/menu" className="sf-btn sf-btn-primary">Browse the menu</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="sf-container">
      <section className="sf-section">
        <div className="sf-section-head">
          <div>
            <h2>Your cart</h2>
            <p>{count} item{count === 1 ? '' : 's'} — {items.length} product{items.length === 1 ? '' : 's'}</p>
          </div>
          <Link to="/menu" className="sf-btn sf-btn-ghost">Continue shopping</Link>
        </div>

        <div className="sf-cart-page">
          <div className="sf-cart-items">
            {items.map((item) => (
              <div key={item.product_id} className="sf-cart-line">
                <img src={item.image_url || '/images/placeholder-cup-pistachios.jpg'} alt="" className="sf-cart-line-img" />
                <div className="sf-cart-line-body">
                  <div className="sf-cart-line-name">{item.name}</div>
                  <div className="sf-cart-line-price">{formatMoney(item.price)} each</div>
                  <QuantityStepperLocal value={item.qty} onChange={(q) => updateQty(item.product_id, q)} />
                </div>
                <button className="sf-remove" onClick={() => remove(item.product_id)}>Remove</button>
              </div>
            ))}
          </div>

          <aside className="sf-cart-summary">
            <h3>Order summary</h3>
            <div className="sf-summary-row">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className="sf-field-hint" style={{ margin: '0 0 16px' }}>
              Delivery fee is added at checkout, based on the settings in the admin panel.
            </p>
            <div className="sf-summary-row total">
              <span>Total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <Link to="/checkout" className="sf-btn sf-btn-primary sf-btn-block" style={{ marginTop: 20 }}>
              Proceed to checkout
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

function QuantityStepperLocal({ value, onChange }) {
  return (
    <span className="sf-qty">
      <button type="button" className="sf-qty-btn" aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <span className="sf-qty-val">{value}</span>
      <button type="button" className="sf-qty-btn" aria-label="Increase" onClick={() => onChange(value + 1)}>+</button>
    </span>
  );
}