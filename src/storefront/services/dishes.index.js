import { isSupabaseConfigured } from '../../lib/supabase';
import * as real from './dishes';
import * as demo from './dishes.demo';

async function withFallback(realFn, demoFn, ...args) {
  if (!isSupabaseConfigured) return demoFn(...args);
  try {
    const data = await realFn(...args);
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn('Supabase returned no rows, using mock data');
      return demoFn(...args);
    }
    return data;
  } catch (err) {
    console.error(err);
    return demoFn(...args);
  }
}

export const fetchMenu = (...a) => withFallback(real.fetchMenu, demo.fetchMenu, ...a);
export const fetchDishes = (...a) => withFallback(real.fetchDishes, demo.fetchDishes, ...a);
export const fetchAvailableDishes = (...a) => withFallback(real.fetchAvailableDishes, demo.fetchAvailableDishes, ...a);
export const fetchFeaturedDishes = (...a) => withFallback(real.fetchFeaturedDishes, demo.fetchFeaturedDishes, ...a);
EOF