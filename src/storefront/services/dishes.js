import { supabase } from '../../lib/supabase';

// Real Supabase queries for the storefront. These THROW on error — callers
// that want a demo fallback must wrap them (see dishes.index.js).
// The browser never sends prices; it only sends dish IDs + quantities.

export async function fetchMenu() {
  const { data, error } = await supabase.from('menus').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchDishes() {
  const { data, error } = await supabase.from('dishes').select('*, menus(name)').order('sort_order');
  if (error) throw error;
  return data || [];
}

// Fetch only available dishes, optionally filtered by menu id.
export async function fetchAvailableDishes(menuId = null) {
  let q = supabase
    .from('dishes')
    .select('*, menus(name)')
    .eq('is_available', true)
    .order('sort_order');

  if (menuId) q = q.eq('menu_id', menuId);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// One featured item per menu for the home page. Falls back to the first
// available item of each menu when there is no is_featured flag set.
export async function fetchFeaturedDishes() {
  const [cats, items] = await Promise.all([fetchMenu(), fetchAvailableDishes()]);
  const byCat = {};
  (items || []).forEach((p) => {
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