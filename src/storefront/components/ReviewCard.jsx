import React from 'react';

export default function ReviewCard({ review }) {
  const author = review.customer_name || 'A guest';
  const dish = review.dish_name || review.dishes?.name || null;
  const rating = Number(review.rating || 0);

  return (
    <article className="sf-review-card review-card-snap">
      <div className="sf-review-stars" aria-label={rating + ' out of 5 stars'} style={{ color: '#D97706', fontSize: '0.875rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ marginRight: '2px' }}>{n <= rating ? '*' : 'o'}</span>
        ))}
      </div>
      <p className="sf-review-quote" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '0.875rem', lineHeight: '1.625', color: 'var(--color-charcoal)', margin: '0 0 0.75rem' }}>
        "{review.comment}"
      </p>
      <div className="sf-review-author" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-charcoal)', marginBottom: '0.25rem' }}>{author}</div>
      {dish && <div className="sf-review-dish" style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dish}</div>}
    </article>
  );
}
