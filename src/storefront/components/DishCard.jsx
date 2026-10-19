import React from 'react';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';

const FOOD_ICON = '🍽️';

export default function DishCard({ dish, onAdd, onQuickView }) {
  const [qty, setQty] = React.useState(1);
  const [editingQty, setEditingQty] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const price = Number(dish.price || 0);
  const hasImage = Boolean(dish.image_url);
  const image = dish.image_url || IMAGES.placeholder;

  return (
    <article className="sf-product-card dish-card">
      <div className="sf-product-media dish-media aspect-square object-cover overflow-hidden rounded-t-xl" onClick={() => onQuickView?.(dish)} style={{ cursor: onQuickView ? 'pointer' : 'default', background: '#EFE8D6' }}>
        {!imageError && hasImage ? (
          <img
            src={image}
            alt={dish.name || 'Dish'}
            loading="lazy"
            data-name={dish.name || 'Dish'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="dish-placeholder">
            <span style="font-size:1.25rem; line-height:1; display:block; margin-bottom:0.25rem;">{FOOD_ICON}</span>
            {(dish.name || 'Dish')} photo coming soon
          </span>
        )}
        {dish.menu_name || (dish.menu && dish.menu.name) ? (
          <span className="sf-product-tag dish-tag">{dish.menu_name || dish.menu.name}</span>
        ) : null}
      </div>
      <div className="sf-product-body dish-body">
        <h3 className="sf-product-name dish-name line-clamp-2 leading-tight">{dish.name}</h3>
        {dish.description && <p className="sf-product-desc dish-desc line-clamp-2">{dish.description}</p>}
        <div className="sf-product-foot dish-foot">
          <span className="sf-product-price dish-price whitespace-nowrap font-semibold text-sm sm:text-base">{formatMoney(price)}</span>
          {editingQty ? (
            <div className="dish-controls">
              <div className="micro-stepper">
                <button
                  type="button"
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  onClick={() => setQty(qty - 1)}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty(qty + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="sf-btn sf-btn-primary sf-add-btn dish-add-btn"
                onClick={() => { onAdd(dish, qty); setEditingQty(false); }}
                aria-label={`Add ${dish.name} to cart`}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sf-btn sf-btn-primary sf-add-btn dish-add-btn dish-add-simple"
              onClick={() => { setEditingQty(true); }}
              aria-label={`Set quantity for ${dish.name}`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
