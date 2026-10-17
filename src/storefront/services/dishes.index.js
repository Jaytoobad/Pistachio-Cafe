import { isSupabaseConfigured } from '../../lib/supabase';
import * as real from './dishes';
import * as demo from './dishes.demo';

export const fetchMenu = isSupabaseConfigured ? real.fetchMenu : demo.fetchMenu;
export const fetchDishes = isSupabaseConfigured ? real.fetchDishes : demo.fetchDishes;
export const fetchAvailableDishes = isSupabaseConfigured ? real.fetchAvailableDishes : demo.fetchAvailableDishes;
export const fetchFeaturedDishes = isSupabaseConfigured ? real.fetchFeaturedDishes : demo.fetchFeaturedDishes;
