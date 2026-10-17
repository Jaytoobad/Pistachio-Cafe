import React from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  const author = review.customer_name || 'A guest';
  const dish = review.dish_name || review.dishes?.name || null;

  return (
    <article className="sf-review-card">
      <StarRating value={Number(review.rating || 0)} readonly />
      <p className="sf-review-comment">{review.comment}</p>
      <div className="sf-review-author">{author}</div>
      {dish && <div className="sf-review-dish">{dish}</div>}
    </article>
  );
}