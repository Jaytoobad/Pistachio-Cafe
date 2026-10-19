import React from 'react';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';

const FOOD_ICON = '🍽️';

export default function DishCard({ dish, onAdd, onQuickView }) {
  const [qty, setQty] = React.useState(1);
  const [editingQty, setEditingQty] = React.useState(false);
  const price = Number(dish.price || 0);

  return (
    <article className="old-product-card dish-card">
      <div
        className="old-product-card-media dish-media"
        onClick={() => onQuickView?.(dish)}
        style={{ cursor: onQuickView ? 'pointer' : 'default' }}
      >
        <SafeImg
          src={dish.image_url}
          label={dish.name || 'Dish'}
          loading="lazy"
          data-name={dish.name || 'Dish'}
          className="w-full h-full object-cover"
        />
        {dish.menu_name || (dish.menu && dish.menu.name) ? (
          <span className="old-product-tag dish-tag">{dish.menu_name || dish.menu.name}</span>
        ) : null}
      </div>
      <div className="old-product-card-body dish-body">
        <h3 className="dish-name">{dish.name}</h3>
        {dish.description && <p className="dish-desc">{dish.description}</p>}
        <div className="old-product-card-foot dish-foot">
          <span className="old-price dish-price">{formatMoney(price)}</span>
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
                className="old-btn old-btn-accent dish-add-btn"
                onClick={() => { onAdd(dish, qty); setEditingQty(false); }}
                aria-label={`Add ${dish.name} to cart`}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="old-btn old-btn-accent dish-add-btn dish-add-simple"
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