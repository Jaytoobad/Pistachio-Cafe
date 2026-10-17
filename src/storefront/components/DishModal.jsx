import React, { useEffect } from 'react';
import { formatMoney } from '../../lib/format';
import QuantityStepper from './QuantityStepper';
import { IMAGES } from '../config';

export default function DishModal({ dish, isOpen, onClose, onAdd }) {
  const [qty, setQty] = React.useState(1);
  const price = Number(dish?.price || 0);
  const image = dish?.image_url || IMAGES.placeholder;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !dish) return null;

  const handleAdd = () => {
    onAdd(dish, qty);
    onClose();
  };

  return (
    <div className="sf-modal-overlay" onClick={onClose} aria-hidden="true">
      <div
        className="sf-modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="sf-modal-close"
          onClick={onClose}
          aria-label="Close dish details"
        >
          ×
        </button>
        <div className="sf-modal-media">
          <img src={image} alt={dish.name || 'Dish'} loading="lazy" />
        </div>
        <div className="sf-modal-body">
          <h2 id="dish-modal-title" className="sf-modal-title">
            {dish.name}
          </h2>
          {dish.description && (
            <p className="sf-modal-desc">{dish.description}</p>
          )}
          <div className="sf-modal-price">{formatMoney(price)}</div>
          <div className="sf-modal-actions">
            <QuantityStepper value={qty} onChange={setQty} aria-label="Quantity" />
            <button
              type="button"
              className="sf-btn sf-btn-primary sf-btn-block"
              onClick={handleAdd}
              aria-label={`Add ${qty} ${dish.name} to cart`}
            >
              Add {qty} to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
