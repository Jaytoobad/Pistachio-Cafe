import { supabase } from '../../lib/supabase';
import { PAYSTACK_PUBLIC_KEY, TO_PAYSTACK, CURRENCY } from '../config';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`;

// Create an order and start Paystack payment.
// The edge function recomputes the total from the dishes table - the browser
// only ever sends dish IDs and quantities.
export async function createOrder({ items, customer_name, phone, email, fulfilment, address, landmark, notes, delivery_fee }) {
  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;

  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      items: items.map((i) => ({ dish_id: i.dish_id, quantity: i.qty })),
      customer_name,
      phone,
      email: email || undefined,
      fulfilment,
      address: address || undefined,
      landmark: landmark || undefined,
      notes: notes || undefined,
      delivery_fee: Number(delivery_fee || 0),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not create order. Please try again.');
  }
  return data;
}

// Verify a payment after Paystack redirects back. Never trusts the browser -
// this asks Paystack directly and only marks the order paid on success.
export async function verifyPayment(reference) {
  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ reference }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Could not verify payment.');
  }
  return data;
}

// Load the Paystack inline script and start a transaction.
export function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.Paystack) return resolve(window.Paystack);
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1.js';
    script.onload = () => resolve(window.Paystack);
    script.onerror = () => reject(new Error('Could not load Paystack.'));
    document.head.appendChild(script);
  });
}

export function openPaystack({ reference, amount, email, publicKey, onSuccess, onClose }) {
  return loadPaystackScript().then((Paystack) => {
    const handler = Paystack.setup({
      key: publicKey || PAYSTACK_PUBLIC_KEY,
      email: email || 'customer@pistachio.cafe',
      amount: TO_PAYSTACK(amount), // cedis -> pesewas
      currency: CURRENCY,
      reference,
      callback: (resp) => {
        if (resp?.reference) onSuccess(resp.reference);
      },
      onClose: () => onClose(),
    });
    handler.openIframe();
    return handler;
  });
}