import React from 'react';

const STAR_PATH = 'm12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85z';

function Star({ filled, onClick, label, disabled }) {
  return (
    <button
      type="button"
      className={filled ? 'sf-on' : ''}
      onClick={() => onClick(label)}
      disabled={disabled}
      aria-label={`${label} star${label === 1 ? '' : 's'}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={STAR_PATH} />
      </svg>
    </button>
  );
}

export default function StarRating({ value, onChange, readonly }) {
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
