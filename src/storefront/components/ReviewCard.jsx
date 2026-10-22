import React from 'react';

const STAR_PATH = 'm12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85z';

// Five small SVG stars. The number is spelled out for screen readers.
function Stars({ rating }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="sf-review-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={n <= value ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewCard({ review }) {
  const author = review.customer_name || 'A guest';
  const dish = review.dish_name || review.dishes?.name || null;
  const rating = Number(review.rating || 0);

  return (
    <article className="sf-review-card review-card-snap">
      <Stars rating={rating} />
      <p className="sf-review-quote">{review.comment}</p>
      <div className="sf-review-author">{author}</div>
      {dish && <div className="sf-review-dish">{dish}</div>}
    </article>
  );
}
