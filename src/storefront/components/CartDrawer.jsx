import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../../lib/format';
import QuantityStepper from './QuantityStepper';
import SafeImg from './SafeImg';
import { CLOSE_SVG } from './SiteHeader';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, remove, subtotal } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const minOrder = Number(settings.minimum_order || 50);
  const gap = Math.max(0, minOrder - subtotal);
  const progress = minOrder > 0 ? Math.min(100, Math.max(0, (subtotal / minOrder) * 100)) : 100;

  if (!open) return null;

  return (
    <>
      <div className="sf-drawer-overlay" onClick={onClose} />
      <div className="sf-cart-drawer">
        <button type="button" className="sf-drawer-close" onClick={onClose} aria-label="Close cart">
          {CLOSE_SVG}
        </button>
        <div className="sf-cart-drawer-head">
          <h2 className="sf-cart-drawer-title">Your basket</h2>
        </div>
        {items.length === 0 ? (
          <div className="sf-cart-empty">
            <p className="sf-cart-empty-title">Your basket is empty</p>
            <p className="sf-cart-empty-desc">Add something from the menu and check out when you\u2019re ready.</p>
            <button type="button" className="sf-btn sf-btn-primary sf-btn-block" onClick={() => { onClose(); navigate('/menu'); }}>
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="sf-cart-list">
              {items.map((item) => (
                <div key={item.dish_id} className="sf-cart-line">
                  <SafeImg
                    src={item.image_url || undefined}
                    label={item.name}
                    className="sf-cart-line-img"
                    alt={item.name}
                    loading="lazy"
                  />
                  <div className="sf-cart-line-body">
                    <div className="sf-cart-line-name">{item.name}</div>
                    <div className="sf-cart-line-unit">{formatMoney(item.price)} each</div>
                  </div>
                  <div className="sf-cart-line-controls">
                    <QuantityStepper
                      value={item.qty}
                      onChange={(qty) => updateQty(item.dish_id, qty)}
                      min={1}
                    />
                    <button
                      type="button"
                      className="sf-cart-line-remove"
                      onClick={() => { remove(item.dish_id); showToast('Item removed'); }}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="sf-cart-line-total">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="sf-cart-divider" aria-hidden="true" />
            <div className="sf-cart-summary">
              <div className="sf-cart-summary-row sf-cart-summary-row--total">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
            </div>
            <div className="sf-cart-minimum">
              <div className="sf-cart-progress">
                <div className="sf-cart-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className={`sf-cart-minimum-text${gap > 0 ? ' sf-cart-minimum-text--gap' : ''}`}>
                {gap > 0 ? `Add ${formatMoney(gap)} to reach the ${formatMoney(minOrder)} minimum order` : `You\u2019ve reached the ${formatMoney(minOrder)} minimum order`}
              </p>
            </div>
            <div className="sf-cart-actions">
              <button type="button" className="sf-btn sf-btn-ghost sf-btn-block" onClick={() => { onClose(); navigate('/cart'); }}>
                View cart
              </button>
              <button type="button" className="sf-btn sf-btn-primary sf-btn-block" onClick={() => { onClose(); navigate('/checkout'); }}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
