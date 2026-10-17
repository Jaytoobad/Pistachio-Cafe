import { supabase } from '../../lib/supabase';
import { fetchCategories, fetchProducts } from '../../services/admin';

export { fetchCategories, fetchProducts };

// Fetch only available products, optionally filtered by category id.
export async function fetchAvailableProducts(categoryId = null) {
  let q = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('is_available', true)
    .order('sort_order');

  if (categoryId) q = q.eq('category_id', categoryId);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// One featured item per category for the home page. Falls back to the first
// available item of each category when there is no is_featured flag set.
export async function fetchFeaturedItems() {
  const [cats, products] = await Promise.all([fetchCategories(), fetchAvailableProducts()]);
  const byCat = {};
  (products || []).forEach((p) => {
    const key = p.category_id;
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(p);
  });

  return (cats || [])
    .map((c) => {
      const list = byCat[c.id] || [];
      const featured = list.find((p) => p.is_featured) || list[0];
      if (!featured) return null;
      return { ...featured, category_name: c.name };
    })
    .filter(Boolean);
}