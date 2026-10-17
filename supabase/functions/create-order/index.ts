// ============================================================================
// EDGE FUNCTION: create-order  (Pistachio Café)
// ============================================================================
// Called by the React checkout page. This is the ONLY place an order's total
// is decided — the browser sends product IDs + quantities, never prices. We
// look up real prices/stock from the database, calculate the trusted total
// ourselves, create a 'pending_payment' order + order_items + a payments
// record, then ask Paystack to start a transaction for that trusted amount.
//
// Deploy with:  supabase functions deploy create-order
// Requires secrets: PAYSTACK_SECRET_KEY, SUPABASE_URL, SERVICE_ROLE_KEY
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL') ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin')?.replace(/\/$/, '');
  let allowOrigin = PUBLIC_SITE_URL || '*';
  if (origin) {
    try {
      const { protocol, hostname } = new URL(origin);
      const isLocal = protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1');
      if (isLocal) allowOrigin = origin;
    } catch {
      // use configured fallback
    }
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

function orderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `PSC-${ymd}-${rand}`;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { items, customer_name, phone, email, fulfilment, address, notes } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: 'Cart is empty.' }, 400, corsHeaders);
    }
    if (!customer_name || !phone) {
      return json({ error: 'Name and phone are required.' }, 400, corsHeaders);
    }

    // Look up dishes server-side so the browser can't inject prices.
    const dishIds = [...new Set(items.map((i: any) => i.dish_id))];
    const { data: dishes, error: dishesError } = await supabase
      .from('dishes')
      .select('id, name, price, is_available')
      .in('id', dishIds);
    if (dishesError) throw dishesError;
    const byId = new Map((dishes ?? []).map((p: any) => [p.id, p]));

    let total = 0;
    const lineItems: any[] = [];
    for (const item of items) {
      const dish = byId.get(item.dish_id);
      if (!dish) return json({ error: `Unknown dish ${item.dish_id}.` }, 400, corsHeaders);
      if (!dish.is_available) return json({ error: `${dish.name} is unavailable.` }, 400, corsHeaders);
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(dish.price);
      const subtotal = unitPrice * qty;
      total += subtotal;
      lineItems.push({
        dish_name: dish.name,
        dish_id: dish.id,
        variant_id: item.variant_id ?? null,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      });
    }

    // Fulfilment + delivery fee come from the settings table, never from the
    // browser, so the total charged to Paystack is always the trusted total.
    const safeFulfilment = String(fulfilment || 'pickup') === 'delivery' ? 'delivery' : 'pickup';
    let deliveryFee = 0;
    if (safeFulfilment === 'delivery') {
      const { data: settingsRow } = await supabase
        .from('settings')
        .select('delivery_fee, delivery_enabled')
        .eq('id', 1)
        .maybeSingle();
      if (settingsRow?.delivery_enabled === false) {
        return json({ error: 'Delivery is currently not available. Please choose pickup.' }, 400, corsHeaders);
      }
      deliveryFee = Number(settingsRow?.delivery_fee || 0);
    }
    const grandTotal = total + deliveryFee;

    const orderCode = orderNumber();
    const reference = `${orderCode}-${Date.now()}`;

    // Create the order (payment fields stay 'pending' until the webhook/verify
    // confirms them; the guard trigger prevents the API from changing them).
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_name,
        phone,
        email: email || null,
        fulfilment: safeFulfilment,
        address: address || null,
        notes: notes || null,
        subtotal: total,
        delivery_fee: deliveryFee,
        total: grandTotal,
        payment_status: 'pending_payment',
        status: 'pending',
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from('order_items').insert(
      lineItems.map((li) => ({ ...li, order_id: order.id }))
    );
    if (itemsError) throw itemsError;

    const { error: paymentError } = await supabase.from('payments').insert({
      order_id: order.id,
      reference,
      amount: grandTotal,
      currency: 'GHS',
      status: 'initialized',
    });
    if (paymentError) throw paymentError;

    // Ask Paystack to initialize the transaction.
    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || undefined,
        amount: Math.round(grandTotal * 100), // kobo
        reference,
        callback_url: `${PUBLIC_SITE_URL.replace(/\/$/, '')}/order-confirmation?reference=${reference}`,
        metadata: { order_code: orderCode, customer_name, phone, fulfilment: safeFulfilment },
      }),
    });
    const initData = await initRes.json();
    if (!initRes.ok || !initData?.data?.access_code) {
      console.error('Paystack initialize failed', initData);
      return json({ error: 'Could not start payment. Please try again.' }, 500, corsHeaders);
    }

    return json({
      order_code: orderCode,
      reference: initData.data.reference,
      access_code: initData.data.access_code,
      authorization_url: initData.data.authorization_url,
      subtotal: total,
      delivery_fee: deliveryFee,
      total: grandTotal,
    }, 200, corsHeaders);
  } catch (err) {
    console.error('create-order failed', { name: err?.name, code: err?.code, message: err?.message });
    return json({ error: 'Could not create order right now. Please try again shortly.' }, 500, corsHeaders);
  }
});





