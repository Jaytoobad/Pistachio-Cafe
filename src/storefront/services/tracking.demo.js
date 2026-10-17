export async function trackOrder(code) {
  const key = 'pistachio_recent_orders';
  try {
    const raw = localStorage.getItem(key);
    const orders = raw ? JSON.parse(raw) : [];
    return orders.find(o => o.order_code === code) || null;
  } catch {
    return null;
  }
}
