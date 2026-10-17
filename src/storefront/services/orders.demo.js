export async function createOrder({ items, customer_name, phone, email, fulfilment, address, notes, delivery_fee }) {
  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0) + (fulfilment === 'delivery' ? Number(delivery_fee || 0) : 0);
  const order_code = `PSC-${Date.now().toString(36).toUpperCase()}`;
  return { order_code, reference: order_code, total };
}

export function openPaystack({ reference, amount, email, publicKey, onSuccess, onClose }) {
  // Simulate success in demo mode
  setTimeout(() => {
    onSuccess && onSuccess(reference);
  }, 300);
  return Promise.resolve({ close: () => {} });
}

export async function verifyPayment(reference) {
  return { reference, status: 'success' };
}