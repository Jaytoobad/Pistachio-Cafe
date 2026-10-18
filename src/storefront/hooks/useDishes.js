import { useState, useEffect, useCallback } from 'react';
import { MOCK_DISHES, MOCK_MENUS } from '../data/mockData';
import { fetchAvailableDishes } from '../services/dishes.index';

// Mock-first hook for dishes. `menuSlug` filters to a single menu when set.
// Renders immediately with mock data; only replaces state when Supabase
// returns rows. On any error the mock data stays and a warning is logged.
export function useDishes(menuSlug = null) {
  const [dishes, setDishes] = useState(() => filterBySlug(MOCK_DISHES, menuSlug));
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableDishes(menuSlug ? menuIdForSlug(menuSlug) : null);
      if (Array.isArray(data) && data.length > 0) setDishes(data);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('useDishes: keeping mock data:', err);
    } finally {
      setLoading(false);
    }
  }, [menuSlug]);

  useEffect(() => { load(); }, [load]);

  return { dishes, loading };
}

function menuIdForSlug(slug) {
  const m = MOCK_MENUS.find((x) => x.slug === slug);
  return m ? m.id : null;
}

function filterBySlug(list, slug) {
  if (!slug) return list;
  const id = menuIdForSlug(slug);
  if (!id) return list;
  return list.filter((d) => d.menu_id === id);
}