import React, { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../../lib/format';
import { imageExists } from '../lib/images';
import { useCart } from '../context/CartContext';

// One small icon for the "no photo yet" tile. No words: the tile is a
// placeholder, not a sentence.
function DishIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 3v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
      <path d="M7 13v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2" />
      <path d="M17 3v4a3 3 0 0 0 3 3h0V3" />
    </svg>
  );
}

// Badges are shown only when they are true.
function badgesFor(dish) {
  const badges = [];
  if (dish.is_featured) badges.push('Popular');
  const tags = Array.isArray(dish.tags) ? dish.tags : [];
  if (tags.some((tag) => /vegetarian/i.test(String(tag)))) badges.push('Vegetarian');
  if (dish.is_available === false) badges.push('Sold out');
  return badges;
}

export default function DishCard({ dish, onAdd, onQuickView }) {
  const { items, updateQty, remove } = useCart();
  const [photoBroken, setPhotoBroken] = useState(false);
  const [qty, setQty] = useState(0);

  const soldOut = dish.is_available === false;
  const price = Number(dish.price || 0);
  const badges = badgesFor(dish);
  const photo = dish.image_url && !photoBroken && imageExists(dish.image_url) ? dish.image_url : null;

  // The cart line for this dish. The id is the link, but the name is used as
  // a fallback so a card keeps its stepper when the kitchen data is swapped
  // under it (the first live rows arriving after the sample rows).
  const cartLine = items.find((item) => item.dish_id === dish.id || item.name === dish.name);

  // Once the cart holds this dish, the card shows a quantity stepper instead
  // of the Add button.
  const hadLine = useRef(false);

  useEffect(() => {
    if (cartLine) {
      hadLine.current = true;
      setQty((current) => (current === 0 ? Number(cartLine.qty) : current));
      return;
    }
    if (hadLine.current) {
      hadLine.current = false;
      setQty(0);
    }
  }, [cartLine]);

  const photoContent = photo ? (
    <img className="dish-image" src={photo} alt="" loading="lazy" onError={() => setPhotoBroken(true)} />
  ) : (
    <span className="dish-photo-missing" aria-hidden="true">
      <DishIcon />
    </span>
  );

  const badgeRow = badges.length > 0 ? (
    <span className="dish-badges">
      {badges.map((badge) => (
        <span key={badge} className={`dish-badge${badge === 'Sold out' ? ' dish-badge--soldout' : ''}`}>
          {badge}
        </span>
      ))}
    </span>
  ) : null;

  const handleAdd = () => {
    setQty(1);
    if (onAdd) onAdd(dish, 1);
  };

  const handleMore = () => {
    const next = qty + 1;
    setQty(next);
    if (cartLine) updateQty(cartLine.dish_id, next);
    else if (onAdd) onAdd(dish, 1);
  };

  const handleLess = () => {
    const next = Math.max(0, qty - 1);
    setQty(next);
    if (!cartLine) return;
    if (next === 0) remove(cartLine.dish_id);
    else updateQty(cartLine.dish_id, next);
  };

  return (
    <article className={`dish-card${soldOut ? ' dish-card--soldout' : ''}`}>
      {onQuickView ? (
        <button
          type="button"
          className="dish-media"
          onClick={() => onQuickView(dish)}
          aria-label={`See details for ${dish.name}`}
        >
          {photoContent}
          {badgeRow}
        </button>
      ) : (
        <div className="dish-media">
          {photoContent}
          {badgeRow}
        </div>
      )}

      <div className="dish-body">
        <h3 className="dish-name">{dish.name}</h3>
        {dish.description && <p className="dish-desc">{dish.description}</p>}

        <div className="dish-foot">
          <span className="dish-price">{formatMoney(price)}</span>

          {soldOut ? (
            <button type="button" className="btn btn-outline dish-add-btn" disabled>
              Sold out
            </button>
          ) : qty > 0 ? (
            <div className="dish-stepper">
              <button type="button" onClick={handleLess} aria-label={`One less ${dish.name}`}>
                &minus;
              </button>
              <span className="dish-stepper-count">{qty}</span>
              <button type="button" onClick={handleMore} aria-label={`One more ${dish.name}`}>
                +
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-accent dish-add-btn" onClick={handleAdd}>
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
