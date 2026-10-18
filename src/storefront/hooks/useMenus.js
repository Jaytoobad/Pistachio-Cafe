import { useState, useEffect, useCallback } from 'react';
import { MOCK_MENUS } from '../data/mockData';
import { fetchMenu } from '../services/dishes.index';

// Mock-first hook: renders immediately with mock data, then silently replaces
// with real rows from Supabase only if the request succeeds. On any error the
// mock data stays and a warning is logged.
export function useMenus() {
  const [menus, setMenus] = useState(MOCK_MENUS);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMenu();
      if (Array.isArray(data) && data.length > 0) setMenus(data);
    } catch (err) {
      if (import.meta.env.DEV) console.warn('useMenus: keeping mock data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { menus, loading };
}