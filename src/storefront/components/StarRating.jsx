import React from 'react';
import { IMAGES } from '../config';

function Star({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      className={filled ? 'sf-on' : ''}
      onClick={() => onClick(label)}
      disabled={disabled}
      aria-label={`${label} star${label === 1 ? '' : 's'}`}
    >
      ★
    </button>
  );
}

export default function StarRating({ value, onChange, readonly, size }) {
  return (
    <div className="sf-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          filled={n <= value}
          label={n}
          disabled={readonly || !onChange}
          onClick={() => onChange && onChange(n)}
        />
      ))}
    </div>
  );
}