import { supabase } from '../../lib/supabase';

// src/admin/services/admin.js
//
// Single write/query layer for the admin panel. Talks to Supabase through the
// shared client in src/lib/supabase.js. RLS + is_staff() enforce that only
// signed-in staff can reach these rows — this file never checks membership
// itself, it just trusts the database.

// --- Orders -----------------------------------------------------------------

// Canonical order lifecycle: received, confirmed, preparing, ready,
// out_for_delivery, delivered, completed, cancelled.
export const ORDER_STATUSES = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'];
export const STATUS_LABELS = {
  received: 'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export async function fetchOrders({ paymentStatus, status, search, dateFrom, dateTo } = {}) {
  let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

  if (paymentStatus) q = q.eq('payment_status', paymentStatus);
  if (status) q = q.in('status', Array.isArray(status) ? status : [status]);
  if (dateFrom) q = q.gte('created_at', dateFrom);
  if (dateTo) q = q.lte('created_at', dateTo);

  const term = search ? String(search).replace(/[,()%*]/g, ' ').trim() : '';
  if (term) q = q.or(`order_code.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function cancelOrder(id) {
  const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function fetchOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function setRider(orderId, riderId) {
  const { error } = await supabase.from('orders').update({ rider_id: riderId }).eq('id', orderId);
  if (error) throw error;
}

export async function fetchRiders() {
  const { data, error } = await supabase.from('riders').select('*').order('name');
  if (error) throw error;
  return data || [];
}

// --- Menu / dishes ----------------------------------------------------------

export async function fetchMenu() {
  const { data, error } = await supabase.from('menu').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchDishes() {
  const { data, error } = await supabase.from('dishes').select('*, menu(name)').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function saveDish(dish, id) {
  if (id) {
    const { data, error } = await supabase.from('dishes').update(dish).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('dishes').insert(dish).select().single();
  if (error) throw error;
  return data;
}

export async function setDishAvailable(id, available) {
  const { error } = await supabase.from('dishes').update({ is_available: available }).eq('id', id);
  if (error) throw error;
}

export async function deleteDish(id) {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadDishImage(file, dishId) {
  const bucket = supabase.storage.from('dish-images');
  const ext = file.name.split('.').pop();
  const path = `dishes/${dishId}/${Date.now()}.${ext}`;
  const { error } = await bucket.upload(path, file, { upsert: false });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
}

// --- Menu sections ----------------------------------------------------------

export async function saveMenuSection(menuSection, id) {
  if (id) {
    const { data, error } = await supabase.from('menu').update(menuSection).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('menu').insert(menuSection).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMenuSection(id) {
  const { error } = await supabase.from('menu').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderMenuSections(orderedIds) {
  const results = orderedIds.map((id, index) =>
    supabase.from('menu').update({ sort_order: index }).eq('id', id),
  );
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

// --- Reviews ----------------------------------------------------------------

export async function fetchReviews() {
  const { data, error } = await supabase.from('reviews').select('*, dishes(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function setReviewApproved(id, approved) {
  const { error } = await supabase.from('reviews').update({ is_approved: approved }).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// --- Newsletter subscribers -------------------------------------------------

export async function fetchSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

// --- Settings ---------------------------------------------------------------

export async function fetchSettings() {
  const { data, error } = await supabase.from('site_settings').select('key,value');
  if (error) throw error;
  const out = {};
  (data || []).forEach((r) => { if (r && r.key != null) out[r.key] = r.value; });
  return out;
}

export async function updateSettings(settings) {
  const rows = Object.entries(settings || {}).map(([key, value]) => ({ key, value, is_public: true }));
  const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
  return settings;
}

// --- Staff ------------------------------------------------------------------

export async function fetchStaff() {
  const { data, error } = await supabase.from('staff').select('*, email').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStaff(userId, role = 'staff') {
  const { data, error } = await supabase.from('staff').insert({ user_id: userId, role, is_active: true }).select().single();
  if (error) throw error;
  return data;
}

export async function removeStaff(id) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}










