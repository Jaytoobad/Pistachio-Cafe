import { useState, useEffect, useCallback } from 'react';
import { STARTER_REVIEWS } from '../data/content';
import { fetchApprovedReviews } from '../services/reviews';

// Mock-first hook for approved reviews. Renders immediately with the starter
// reviews (marked PLACEHOLDER in content.js), then silently replaces with
// real rows from Supabase only if the request succeeds. On any error the
// starter reviews stay. Starter reviews only show when no approved reviews
// exist yet — once real rows arrive they are hidden.
export function useReviews() {
  const [reviews, setReviews] = useState(STARTER_REVIEWS);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovedReviews();
      if (Array.isArray(data) && data.length > 0) setReviews(data);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('useReviews: keeping starter reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { reviews, loading };
}