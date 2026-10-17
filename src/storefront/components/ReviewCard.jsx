import React from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  const name = review.customer_name || 'A guest';
  const product = review.product_name || review.dishes?.name || null;

  return (
    <article className="sf-review-card">
      <StarRating value={Number(review.rating || 0)} readonly />
      <p className="sf-review-comment">{review.comment}</p>
      <div className="sf-review-author">{name}</div>
      {product && <div className="sf-review-product">{product}</div>}
    </article>
  );
}