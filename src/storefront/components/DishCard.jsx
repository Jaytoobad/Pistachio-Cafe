import React from 'react';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';
import { useFavourites } from '../context/FavouritesContext';

const FOOD_ICON = '🍽️';

const HEART_SVG = (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18.5 4.5c-1.2-1.2-3-1.2-4.2 0L12 6.8l-2.3-2.3c-1.2-1.2-3-1.2-4.2 0-1.2 1.2-1.2 3 0 4.2l4.5 4.5 4.5-4.5c1.2-1.2 1.2-3 0-4.2" />
  </svg>
);

const HEART_FILLED_SVG = (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18.5 4.5c-1.2-1.2-3-1.2-4.2 0L12 6.8l-2.3-2.3c-1.2-1.2-3-1.2-4.2 0-1.2 1.2-1.2 3 0 4.2l4.5 4.5 4.5-4.5c1.2-1.2 1.2-3 0-4.2" />
  </svg>
);

export default function DishCard({ dish, onAdd, onQuickView }) {
  const { toggle, isFav } = useFavourites();
  const [qty, setQty] = React.useState(1);
  const [editingQty, setEditingQty] = React.useState(false);
  const price = Number(dish.price || 0);

  return (
    <article className="dish-card card" style={{ position: 'relative' }}>
      <button
        type="button"
        className="dish-fav"
        aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => { e.stopPropagation(); toggle(dish.id); }}
      >
        {isFav ? HEART_FILLED_SVG : HEART_SVG}
      </button>
      <div
        className="dish-media"
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
          <span className="dish-tag">{dish.menu_name || dish.menu.name}</span>
        ) : null}
      </div>
      <div className="dish-body">
        <h3 className="dish-name">{dish.name}</h3>
        {dish.description && <p className="dish-desc">{dish.description}</p>}
        <div className="dish-foot">
          <span className="dish-price">{formatMoney(price)}</span>
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
                className="btn btn-accent dish-add-btn"
                onClick={() => { onAdd(dish, qty); setEditingQty(false); }}
                aria-label={`Add ${dish.name} to cart`}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-accent dish-add-btn dish-add-simple"
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