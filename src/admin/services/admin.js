// src/admin/services/admin.js
//
// Single write/query layer for the admin panel. Talks to Supabase through the
// shared client in src/lib/supabase.js. RLS + is_staff() enforce access — this
// layer never checks membership itself, it trusts the database.

import { supabase } from '../../lib/supabase';

// Canonical order lifecycle.
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

const STAFF_ROLES = ['admin', 'manager', 'kitchen', 'rider'];

// --- Orders ------------------------------------------------------------------

export async function fetchOrders({ paymentStatus, status, search, dateFrom, dateTo } = {}) {
  let q = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

  if (paymentStatus) q = q.eq('payment_status', paymentStatus);
  if (status) q = q.in('status', Array.isArray(status) ? status : [status]);
  if (dateFrom) q = q.gte('created_at', dateFrom);
  if (dateTo) q = q.lte('created_at', `${dateTo}T23:59:59`);

  const term = search ? String(search).replace(/[,()%*]/g, ' ').trim() : '';
  if (term) q = q.or(`order_code.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function fetchOrderHistory(orderId) {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('status, note, changed_by, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

function itemName(item) { return item.name || item.dish_name || 'Item'; }
function itemQty(item) { return item.qty != null ? item.qty : item.quantity; }

export async function updateOrder(id, patch) {
  const { error } = await supabase.from('orders').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateOrderStatus(id, status, note, changedBy) {
  const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  try {
    await supabase.from('order_status_history').insert({ order_id: id, status, note: note || null, changed_by: changedBy || null });
  } catch (err) {
    // History is best-effort if the schema lacks changed_by / RLS blocks it.
    if (import.meta.env.DEV) console.warn('order_status_history insert skipped:', err);
  }
}

export async function cancelOrder(id, reason, changedBy) {
  const { error } = await supabase.from('orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  try {
    await supabase.from('order_status_history').insert({ order_id: id, status: 'cancelled', note: reason || 'Order cancelled.', changed_by: changedBy || null });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('order_status_history insert skipped:', err);
  }
}

export async function setRider(orderId, riderId, changedBy) {
  const { error } = await supabase.from('orders').update({ rider_id: riderId, updated_at: new Date().toISOString() }).eq('id', orderId);
  if (error) throw error;
  try {
    await supabase.from('order_status_history').insert({ order_id: orderId, note: 'Rider assigned.', changed_by: changedBy || null });
  } catch (err) {
    if (import.meta.env.DEV) console.warn('order_status_history insert skipped:', err);
  }
}

export async function fetchRiders() {
  const { data, error } = await supabase.from('riders').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function saveRider(rider, id) {
  const payload = { name: rider.name, phone: rider.phone || null, is_active: rider.is_active !== false };
  if (id) {
    const { data, error } = await supabase.from('riders').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('riders').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRider(id) {
  const { error } = await supabase.from('riders').delete().eq('id', id);
  if (error) throw error;
}

// --- Menu / dishes ----------------------------------------------------------

export async function fetchMenus() {
  const { data, error } = await supabase.from('menus').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function saveMenu(menu, id) {
  const payload = { name: menu.name, slug: menu.slug, sort_order: Number(menu.sort_order || 0), is_visible: menu.is_visible !== false };
  if (id) {
    const { data, error } = await supabase.from('menus').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('menus').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMenu(id) {
  const { error } = await supabase.from('menus').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderMenus(orderedIds) {
  const results = orderedIds.map((id, index) => supabase.from('menus').update({ sort_order: index }).eq('id', id));
  await Promise.all(results);
}

export async function fetchDishes() {
  const { data, error } = await supabase.from('dishes').select('*, menus(name)').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function saveDish(dish, id) {
  const payload = {
    name: dish.name,
    slug: dish.slug,
    menu_id: dish.menu_id,
    description: dish.description || null,
    price: Number(dish.price || 0),
    image_url: dish.image_url || null,
    is_available: dish.is_available !== false,
    is_featured: !!dish.is_featured,
    is_hidden: !!dish.is_hidden,
    tags: Array.isArray(dish.tags) ? dish.tags : (dish.tags ? String(dish.tags).split(',').map((t) => t.trim()).filter(Boolean) : []),
    sort_order: Number(dish.sort_order || 0),
  };
  if (id) {
    const { data, error } = await supabase.from('dishes').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('dishes').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function setDishAvailable(id, available) {
  const { error } = await supabase.from('dishes').update({ is_available: available }).eq('id', id);
  if (error) throw error;
}

export async function reorderDishes(orderedIds) {
  const results = orderedIds.map((id, index) => supabase.from('dishes').update({ sort_order: index }).eq('id', id));
  await Promise.all(results);
}

export async function deleteDish(id) {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw error;
}

// --- Dish image upload (client resize, validation) --------------------------

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIM = 1200;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resizeImage(dataUrl, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error('Could not read image.'));
    img.src = dataUrl;
  });
}

export async function uploadDishImage(file, dishId) {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Only JPG, PNG and WEBP images are supported.');
  if (file.size > MAX_BYTES) throw new Error('Image must be smaller than 5 MB.');

  const dataUrl = await readAsDataUrl(file);
  const blob = await resizeImage(dataUrl, MAX_DIM);

  const bucket = supabase.storage.from('dish-images');
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `dishes/${dishId}/${Date.now()}.${ext}`;
  const { error } = await bucket.upload(path, blob, { upsert: false, contentType: file.type });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
}

// --- Menu sections alias -----------------------------------------------------

export const fetchMenu = fetchMenus;
export const saveMenuSection = saveMenu;
export const deleteMenuSection = deleteMenu;
export const reorderMenuSections = reorderMenus;

// --- Add-ons -----------------------------------------------------------------

export async function fetchDishAddons() {
  const { data, error } = await supabase.from('dish_addons').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function saveDishAddon(addon, id) {
  const payload = { dish_id: addon.dish_id, name: addon.name, price: Number(addon.price || 0), is_available: addon.is_available !== false, sort_order: Number(addon.sort_order || 0) };
  if (id) {
    const { data, error } = await supabase.from('dish_addons').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('dish_addons').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDishAddon(id) {
  const { error } = await supabase.from('dish_addons').delete().eq('id', id);
  if (error) throw error;
}

// --- Settings ----------------------------------------------------------------

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

// --- Staff -------------------------------------------------------------------

export async function fetchStaff() {
  const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStaff(userId, role = 'staff') {
  if (!STAFF_ROLES.includes(role)) role = 'staff';
  const { data, error } = await supabase.from('staff').insert({ user_id: userId, role, is_active: true }).select().single();
  if (error) throw error;
  return data;
}

export async function updateStaff(id, patch) {
  const { data, error } = await supabase.from('staff').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function removeStaff(id) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}

// --- Reviews -----------------------------------------------------------------

export async function fetchReviews() {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
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

// --- Subscribers -------------------------------------------------------------

export async function fetchSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteSubscriber(id) {
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
  if (error) throw error;
}

// --- Dashboard stats ---------------------------------------------------------

export async function fetchDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_code, total, payment_status, status, created_at, order_items(name, qty, unit_price)')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = orders || [];
  const todayOrders = rows.filter((o) => isSameDayAccra(o.created_at, today));
  const paidToday = todayOrders.filter((o) => o.payment_status === 'paid');
  const revenueToday = paidToday.reduce((s, o) => s + Number(o.total || 0), 0);
  const aov = paidToday.length ? revenueToday / paidToday.length : 0;

  const waiting = todayOrders.filter((o) => o.status === 'received' || o.status === 'confirmed').length;
  const inKitchen = todayOrders.filter((o) => o.status === 'preparing' || o.status === 'ready').length;
  const outForDelivery = todayOrders.filter((o) => o.status === 'out_for_delivery' || o.status === 'delivered').length;
  const completed = todayOrders.filter((o) => o.status === 'completed').length;

  const hourCounts = {};
  todayOrders.forEach((o) => {
    const h = new Date(o.created_at).toLocaleString('en-US', { timeZone: 'Africa/Accra', hour: 'numeric', hour12: false });
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const busiestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestHourLabel = busiestHour ? `${busiestHour[0]}:00 (${busiestHour[1]} orders)` : '—';

  const dishCounts = {};
  rows.forEach((o) => {
    (o.order_items || []).forEach((it) => {
      const name = itemName(it);
      dishCounts[name] = (dishCounts[name] || 0) + Number(itemQty(it) || 0);
    });
  });
  const bestSellers = Object.entries(dishCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const daily = {};
  rows.forEach((o) => {
    if (o.payment_status !== 'paid') return;
    const day = o.created_at.slice(0, 10);
    daily[day] = (daily[day] || 0) + Number(o.total || 0);
  });
  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    revenueChart.push({ day: d.toLocaleDateString('en-GH', { weekday: 'short' }), revenue: daily[key] || 0 });
  }

  return {
    waiting,
    inKitchen,
    outForDelivery,
    completed,
    revenueToday,
    aov,
    ordersToday: todayOrders.length,
    busiestHour: busiestHourLabel,
    bestSellers,
    revenueChart,
  };
}

function isSameDayAccra(iso, ref) {
  return new Date(iso).toLocaleDateString('en-GH', { timeZone: 'Africa/Accra' }) === ref.toLocaleDateString('en-GH', { timeZone: 'Africa/Accra' });
}

// --- Customers (built from orders) ------------------------------------------

export async function fetchCustomers() {
  const { data: orders, error } = await supabase.from('orders').select('customer_name, phone, email, total, payment_status, created_at, fulfilment').order('created_at', { ascending: false });
  if (error) throw error;
  const byKey = {};
  (orders || []).forEach((o) => {
    const key = (o.email || o.phone || o.customer_name).trim().toLowerCase() || `guest-${o.order_code || Math.random()}`;
    if (!byKey[key]) byKey[key] = { name: o.customer_name, phone: o.phone, email: o.email, orders: [], totalSpent: 0, lastOrder: null };
    const c = byKey[key];
    c.orders.push(o);
    if (o.payment_status === 'paid') c.totalSpent += Number(o.total || 0);
    const d = new Date(o.created_at);
    if (!c.lastOrder || d > new Date(c.lastOrder.created_at)) c.lastOrder = o;
  });
  return Object.values(byKey).sort((a, b) => b.totalSpent - a.totalSpent);
}

// --- Reports -----------------------------------------------------------------

export async function fetchReport({ dateFrom, dateTo }) {
  let q = supabase.from('orders').select('id, order_code, total, payment_status, status, created_at, order_items(name, qty, unit_price)');
  if (dateFrom) q = q.gte('created_at', `${dateFrom}T00:00:00`);
  if (dateTo) q = q.lte('created_at', `${dateTo}T23:59:59`);
  const { data, error } = await q.order('created_at', { ascending: true });
  if (error) throw error;
  const rows = data || [];

  const byDay = {};
  const byDish = {};
  rows.forEach((o) => {
    if (o.payment_status !== 'paid') return;
    const day = o.created_at.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + Number(o.total || 0);
    (o.order_items || []).forEach((it) => {
      const name = itemName(it);
      if (!byDish[name]) byDish[name] = { qty: 0, revenue: 0 };
      byDish[name].qty += Number(itemQty(it) || 0);
      byDish[name].revenue += Number(itemQty(it) || 0) * Number(it.unit_price || 0);
    });
  });

  const days = [];
  const start = dateFrom ? new Date(dateFrom) : new Date(Math.min(...rows.map((o) => new Date(o.created_at))));
  const end = dateTo ? new Date(dateTo) : new Date();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    days.push({ day: d.toLocaleDateString('en-GH'), revenue: byDay[key] || 0 });
  }

  const dishes = Object.entries(byDish).map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue })).sort((a, b) => b.revenue - a.revenue);
  const total = dishes.reduce((s, d) => s + d.revenue, 0);
  return { days, dishes, total };
}

// --- Exports -----------------------------------------------------------------

export function csvExport(rows, columns) {
  const header = columns.map((c) => JSON.stringify(c.label || c)).join(',');
  const lines = [header];
  rows.forEach((row) => {
    lines.push(columns.map((c) => {
      const v = row[c.key || c] == null ? '' : row[c.key || c];
      return JSON.stringify(String(v));
    }).join(','));
  });
  return lines.join('\n');
}

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
