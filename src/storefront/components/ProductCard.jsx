import React from 'react';
import { formatMoney } from '../../../lib/format';
import QuantityStepper from './QuantityStepper';

export default function ProductCard({ product, onAdd }) {
  const [qty, setQty] = React.useState(1);
  const price = Number(product.price || 0);
  const image = product.image_url || '/images/placeholder-cup-pistachios.jpg';

  return (
    <article className="sf-product-card">
      <div className="sf-product-media">
        <img src={image} alt="" loading="lazy" />
        {product.category_name && (
          <span className="sf-product-tag">{product.category_name}</span>
        )}
      </div>
      <div className="sf-product-body">
        <h3 className="sf-product-name">{product.name}</h3>
        {product.description && <p className="sf-product-desc">{product.description}</p>}
        <div className="sf-product-foot">
          <span className="sf-product-price">{formatMoney(price)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuantityStepper value={qty} onChange={setQty} />
            <button
              type="button"
              className="sf-btn sf-btn-primary sf-add-btn"
              onClick={() => onAdd(product, qty)}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}