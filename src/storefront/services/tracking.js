import { supabase } from '../../lib/supabase';

// Tracking uses a SECURITY DEFINER Postgres function so anonymous customers can
// look up their order by code + phone without being able to read the orders
// table. The function returns one jsonb object with the public-safe fields.
// The customer side never uses realtime - it polls every 10-15 seconds.
export async function trackOrder(code, phone) {
  const { data, error } = await supabase.rpc('track_order', {
    p_code: String(code || '').trim(),
    p_phone: String(phone || '').trim(),
  });
  if (error) throw error;
  return data || null;
}