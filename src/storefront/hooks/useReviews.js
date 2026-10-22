import { useState, useEffect, useCallback } from 'react';
import { fetchApprovedReviews } from '../services/reviews';

// Approved reviews only, straight from the database. There is no sample
// fallback: if there are no approved reviews yet the storefront shows the
// review form and nothing else.
export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovedReviews();
      if (Array.isArray(data)) setReviews(data);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('useReviews: no approved reviews available:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { reviews, loading };
}
