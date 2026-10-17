import React from 'react';
import { formatMoney } from '../../lib/format';
import QuantityStepper from './QuantityStepper';
import { IMAGES } from '../config';

export default function DishCard({ dish, onAdd, onQuickView }) {
  const [qty, setQty] = React.useState(1);
  const price = Number(dish.price || 0);
  const image = dish.image_url || IMAGES.placeholder;

  return (
    <article className="sf-product-card">
      <div className="sf-product-media" onClick={() => onQuickView?.(dish)} style={{ cursor: onQuickView ? 'pointer' : 'default' }}>
        <img src={image} alt={dish.name || 'Dish'} loading="lazy" />
        {dish.menu_name || (dish.menu && dish.menu.name) ? (
          <span className="sf-product-tag">{dish.menu_name || dish.menu.name}</span>
        ) : null}
      </div>
      <div className="sf-product-body">
        <h3 className="sf-product-name">{dish.name}</h3>
        {dish.description && <p className="sf-product-desc">{dish.description}</p>}
        <div className="sf-product-foot">
          <span className="sf-product-price">{formatMoney(price)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <QuantityStepper value={qty} onChange={setQty} aria-label="Quantity" />
            <button
              type="button"
              className="sf-btn sf-btn-primary sf-add-btn"
              onClick={() => onAdd(dish, qty)}
              aria-label={`Add ${dish.name} to cart`}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
