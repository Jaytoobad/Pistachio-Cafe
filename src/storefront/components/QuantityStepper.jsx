import React from 'react';

export default function QuantityStepper({ value, onChange, min = 1, max, disabled }) {
  return (
    <span className="sf-qty">
      <button
        className="sf-qty-btn"
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="sf-qty-val">{value}</span>
      <button
        type="button"
        className="sf-qty-btn"
        disabled={disabled || (max && value >= max)}
        aria-label="Increase quantity"
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
      >
        +
      </button>
    </span>
  );
}








