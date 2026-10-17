import { supabase } from '../lib/supabase';

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

// --- Menu ---

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*, categories(name)').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function saveProduct(product, id) {
  if (id) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function setProductAvailable(id, available) {
  const { error } = await supabase.from('products').update({ is_available: available }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadProductImage(file, productId) {
  const bucket = supabase.storage.from('product-images');
  const ext = file.name.split('.').pop();
  const path = `products/${productId}/${Date.now()}.${ext}`;
  const { error } = await bucket.upload(path, file, { upsert: false });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
}

// --- Categories ---

export async function saveCategory(category, id) {
  if (id) {
    const { data, error } = await supabase.from('categories').update(category).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('categories').insert(category).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderCategories(orderedIds) {
  const results = orderedIds.map((id, index) =>
    supabase.from('categories').update({ sort_order: index }).eq('id', id),
  );
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

// --- Reviews ---

export async function fetchReviews() {
  const { data, error } = await supabase.from('reviews').select('*, products(name)').order('created_at', { ascending: false });
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

// --- Newsletter subscribers ---

export async function fetchSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

// --- Settings ---

export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

export async function updateSettings(settings) {
  const { data, error } = await supabase.from('settings').update(settings).eq('id', 1).select().single();
  if (error) throw error;
  return data;
}

// --- Staff ---

export async function fetchStaff() {
  const { data, error } = await supabase.from('staff').select('*, profiles(email)').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStaff(userId) {
  const { data, error } = await supabase.from('staff').insert({ user_id: userId }).select().single();
  if (error) throw error;
  return data;
}

export async function removeStaff(id) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}


