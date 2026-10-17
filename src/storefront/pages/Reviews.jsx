import React, { useCallback, useEffect, useState } from 'react';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { fetchApprovedReviews } from '../services/reviews';
import ReviewCard from '../components/ReviewCard';
import SectionHeading from '../components/SectionHeading';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useDocumentTitle('Reviews | Pistachio Café');

  const load = useCallback(() => {
    fetchApprovedReviews().then((r) => setReviews(r || [])).catch(() => setReviews([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="sf-container">
        <div className="sf-loading"><div className="sf-spinner" aria-label="Loading" /></div>
      </div>
    );
  }

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
