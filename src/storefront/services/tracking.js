import { supabase } from '../../lib/supabase';

// Tracking uses a SECURITY DEFINER Postgres function so anonymous customers can
// look up their order by code without being able to read the orders table.
// The function returns only status + non-sensitive fields.
export async function trackOrder(code) {
  const { data, error } = await supabase.rpc('track_order', { code: String(code || '').trim() });
  if (error) throw error;
  return data || null;
}