import React from 'react';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { useReviews } from '../hooks/useReviews';
import ReviewCard from '../components/ReviewCard';
import SectionHeading from '../components/SectionHeading';

export default function Reviews() {
  const { reviews, loading } = useReviews();
  useDocumentTitle('Reviews | Pistachio Caf\u00e9');

  return (
    <div className="sf-container min-h-dvh px-4 py-6">
      <section className="sf-section">
        <SectionHeading title="Customer reviews" subtitle="What our guests are saying" />
        {reviews.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center' }}>No approved reviews yet.</p>
        ) : (
          <div className="review-carousel">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
