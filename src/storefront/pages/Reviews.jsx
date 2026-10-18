import React from 'react';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { useReviews } from '../hooks/useReviews';
import ReviewCard from '../components/ReviewCard';
import SectionHeading from '../components/SectionHeading';

export default function Reviews() {
  const { reviews, loading } = useReviews();
  useDocumentTitle('Reviews | Pistachio Café');

  // Mock-first: pages never return null while loading and are never blank.
  return (
    <div className="sf-container">
      <section className="sf-section">
        <SectionHeading title="Customer reviews" subtitle="What our guests are saying" />
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No approved reviews yet.</p>
        ) : (
          <div className="sf-review-grid">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}