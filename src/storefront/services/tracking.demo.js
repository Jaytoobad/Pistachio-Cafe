export async function trackOrder(code, phone) {
  const key = 'pistachio_recent_orders';
  try {
    const raw = localStorage.getItem(key);
    const orders = raw ? JSON.parse(raw) : [];
    const found = orders.find(o => o.order_code === code && (!phone || o.phone === String(phone).replace(/\D/g, '')));
    if (!found) return null;
    return {
      order_code: found.order_code,
      status: found.status,
      payment_status: found.payment_status,
      fulfilment: found.fulfilment,
      subtotal: found.subtotal,
      delivery_fee: found.delivery_fee,
      total: found.total,
      address: found.address ?? null,
      landmark: found.landmark ?? null,
      estimated_minutes: found.estimated_minutes ?? null,
      created_at: found.created_at,
      rider: found.rider ?? null,
      items: found.items ?? [],
      history: found.history ?? [],
    };
  } catch {
    return null;
  }
}