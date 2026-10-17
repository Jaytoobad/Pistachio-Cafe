import { isSupabaseConfigured, supabase } from '../supabase';
import { MOCK_DISHES, MOCK_MENU_SECTIONS } from '../../storefront/data/mockData';

function toSafeResult(data) {
  return data || [];
}

export async function fetchMenu() {
  if (!isSupabaseConfigured || !supabase) {
    return toSafeResult(MOCK_MENU_SECTIONS);
  }
  try {
    const { data, error } = await supabase.from('menu').select('*').order('sort_order');
    if (error) throw error;
    return toSafeResult(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('fetchMenu failed, using mock data:', err);
    }
    return toSafeResult(MOCK_MENU_SECTIONS);
  }
}

export async function fetchDishes() {
  if (!isSupabaseConfigured || !supabase) {
    return toSafeResult(MOCK_DISHES);
  }
  try {
    const { data, error } = await supabase.from('dishes').select('*, menu(name)').order('sort_order');
    if (error) throw error;
    return toSafeResult(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('fetchDishes failed, using mock data:', err);
    }
    return toSafeResult(MOCK_DISHES);
  }
}

export async function fetchAvailableDishes(menuId = null) {
  if (!isSupabaseConfigured || !supabase) {
    const dishes = MOCK_DISHES.filter((d) => d.is_available !== false);
    if (menuId) {
      return dishes.filter((d) => d.menu_id === menuId);
    }
    return dishes;
  }
  try {
    let q = supabase
      .from('dishes')
      .select('*, menu(name)')
      .eq('is_available', true)
      .order('sort_order');
    if (menuId) q = q.eq('menu_id', menuId);
    const { data, error } = await q;
    if (error) throw error;
    return toSafeResult(data);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('fetchAvailableDishes failed, using mock data:', err);
    }
    const dishes = MOCK_DISHES.filter((d) => d.is_available !== false);
    if (menuId) {
      return dishes.filter((d) => d.menu_id === menuId);
    }
    return dishes;
  }
}

export async function fetchFeaturedDishes() {
  if (!isSupabaseConfigured || !supabase) {
    const cats = MOCK_MENU_SECTIONS;
    const dishes = MOCK_DISHES.filter((d) => d.is_available !== false);
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
    if (import.meta.env.DEV) {
      console.warn('fetchFeaturedDishes failed, using mock data:', err);
    }
    const cats = MOCK_MENU_SECTIONS;
    const dishes = MOCK_DISHES.filter((d) => d.is_available !== false);
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
  }
}
