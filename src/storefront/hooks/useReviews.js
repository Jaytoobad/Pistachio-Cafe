import { useState, useEffect, useCallback } from 'react';
import { MOCK_REVIEWS } from '../data/mockData';
import { fetchApprovedReviews } from '../services/reviews';

// Mock-first hook for approved reviews. Renders immediately with mock data,
// then silently replaces with real rows from Supabase only if the request
// succeeds. On any error the mock data stays and a warning is logged.
export function useReviews() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApprovedReviews();
      if (Array.isArray(data) && data.length > 0) setReviews(data);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('useReviews: keeping mock data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { reviews, loading };
}