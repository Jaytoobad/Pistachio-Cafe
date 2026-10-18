import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { MOCK_MENUS, MOCK_DISHES } from '../data/mockData';

// Mock-first fetch: return mock data immediately, then try Supabase in the
// background. Only replace the state if Supabase returns rows. On any error
// keep the mock data and log a warning.
export async function fetchMenu() {
  if (!isSupabaseConfigured || !supabase) return MOCK_MENUS;
  try {
    const { data, error } = await supabase.from('menus').select('*').order('sort_order');
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('fetchMenu failed, using mock data:', err);
  }
  return MOCK_MENUS;
}

export async function fetchDishes() {
  if (!isSupabaseConfigured || !supabase) return MOCK_DISHES;
  try {
    const { data, error } = await supabase.from('dishes').select('*, menus(name)').order('sort_order');
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('fetchDishes failed, using mock data:', err);
  }
  return MOCK_DISHES;
}

export async function fetchAvailableDishes(menuId = null) {
  if (!isSupabaseConfigured || !supabase) {
    let items = MOCK_DISHES.filter((d) => d.is_available !== false);
    if (menuId) items = items.filter((d) => d.menu_id === menuId);
    return items;
  }
  try {
    let q = supabase
      .from('dishes')
      .select('*, menus(name)')
      .eq('is_available', true)
      .order('sort_order');
    if (menuId) q = q.eq('menu_id', menuId);
    const { data, error } = await q;
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('fetchAvailableDishes failed, using mock data:', err);
  }
  let items = MOCK_DISHES.filter((d) => d.is_available !== false);
  if (menuId) items = items.filter((d) => d.menu_id === menuId);
  return items;
}

export async function fetchFeaturedDishes() {
  if (!isSupabaseConfigured || !supabase) {
    const byCat = {};
    MOCK_DISHES.filter((d) => d.is_available !== false).forEach((p) => {
      const key = p.menu_id;
      if (!byCat[key]) byCat[key] = [];
      byCat[key].push(p);
    });
    return MOCK_MENUS
      .map((c) => {
        const list = byCat[c.id] || [];
        const featured = list.find((p) => p.is_featured) || list[0];
        if (!featured) return null;
        return { ...featured, menu_name: c.name };
      })
      .filter(Boolean);
  }
  try {
    const [cats, dishes] = await Promise.all([fetchMenu(), fetchAvailableDishes()]);
    const byCat = {};
    (dishes || []).forEach((p) => {
      const key = p.menu_id;
      if (!byCat[key]) byCat[key] = [];
      byCat[key].push(p);
    });
    return (cats || [])
      .map((c) => {
        const list = byCat[c.id] || [];
        const featured = list.find((p) => p.is_featured) || list[0];
        if (!featured) return null;
        return { ...featured, menu_name: c.name };
      })
      .filter(Boolean);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('fetchFeaturedDishes failed, using mock data:', err);
    const byCat = {};
    MOCK_DISHES.filter((d) => d.is_available !== false).forEach((p) => {
      const key = p.menu_id;
      if (!byCat[key]) byCat[key] = [];
      byCat[key].push(p);
    });
    return MOCK_MENUS
      .map((c) => {
        const list = byCat[c.id] || [];
        const featured = list.find((p) => p.is_featured) || list[0];
        if (!featured) return null;
        return { ...featured, menu_name: c.name };
      })
      .filter(Boolean);
  }
}