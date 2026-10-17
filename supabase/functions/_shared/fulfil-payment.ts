// ============================================================================
// EDGE FUNCTION: _shared/fulfil-payment  (Pistachio Café)
// ============================================================================
// Shared payment fulfilment used by verify-payment (browser redirect) and
// paystack-webhook (server-to-server). Both call verifyAndFulfil(), which asks
// Paystack directly whether a payment_reference succeeded, then marks the order
// paid, adjusts stock and records status history exactly once (idempotent).
//
// Order statuses: received, confirmed, preparing, ready, out_for_delivery,
// delivered, completed, cancelled. Payment success moves the order to
// 'confirmed' (kitchen starts preparing from there).
//
// Deployed functions that import this:
//   supabase functions deploy verify-payment
//   supabase functions deploy paystack-webhook --no-verify-jwt
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// The service-role client bypasses RLS — intentional; this code runs on the
// server and carefully controls what it writes.
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Every failure path sets `retryable`. Callers branch on this flag, never the
// message text.
//
//   retryable: true  — transient; Paystack should redeliver the event.
//   retryable: false — final; retrying cannot change the outcome.
export type FulfilFailure = { error: string; retryable: boolean; orderId?: string | null };

export async function verifyAndFulfil(paymentReference: string) {
  const { data: payment, error: paymentErr } = await supabase
    .from('payments')
    .select('*, orders(*)')
    .eq('payment_reference', paymentReference)
    .maybeSingle();

  if (paymentErr || !payment) {
    return { error: 'Payment reference not found.', retryable: false, orderId: null };
  }

  // Idempotency guard: already processed as successful.
  if (payment.status === 'success' && payment.orders?.payment_status === 'paid') {
    return { orderId: payment.order_id, orderNumber: payment.orders.order_code, status: payment.orders.status, alreadyProcessed: true };
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  });
  const verifyData = await verifyRes.json();

  if (!verifyData.status || verifyData.data?.status !== 'success') {
    const finalFailure = ['failed', 'abandoned', 'reversed'].includes(verifyData.data?.status);
    if (finalFailure) {
      await supabase.from('payments').update({ status: 'failed', paystack_raw: verifyData }).eq('payment_reference', paymentReference);
      await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', payment.order_id).not('payment_status', 'in', '(paid,refunded)');
    }
    return {
      error: finalFailure ? 'Payment was not successful.' : 'Your payment is still being processed.',
      retryable: !finalFailure,
      orderId: payment.order_id,
    };
  }

  // Confirm the amount Paystack charged matches our trusted total.
  const expectedAmount = Math.round(Number(payment.amount) * 100);
  if (verifyData.data.amount !== expectedAmount) {
    console.error('Amount mismatch on reference', paymentReference);
    return { error: 'Payment amount could not be verified.', retryable: false, orderId: payment.order_id };
  }

  await supabase.from('payments').update({ status: 'success', channel: verifyData.data.channel, paystack_raw: verifyData }).eq('payment_reference', paymentReference);

  const { data: paidOrder, error: orderUpdateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', payment.order_id)
    .neq('payment_status', 'paid')
    .neq('payment_status', 'refunded')
    .not('status', 'in', '(cancelled,refunded)')
    .select()
    .maybeSingle();

  if (orderUpdateError) throw orderUpdateError;
  if (!paidOrder) {
    const { data: current } = await supabase.from('orders').select('order_code, status, payment_status').eq('id', payment.order_id).maybeSingle();
    const wasCancelled = current && current.payment_status !== 'paid' &&
      (current.status === 'cancelled' || current.status === 'refunded' || current.payment_status === 'refunded');
    if (wasCancelled) {
      await supabase.from('order_status_history').insert({
        order_id: payment.order_id,
        status: current?.status ?? 'cancelled',
        note: 'Payment received for an order that was already closed. Not fulfilled — arrange a refund.',
      });
      return {
        error: 'This order was cancelled. Please contact us on WhatsApp so we can arrange your refund.',
        retryable: false,
        orderId: payment.order_id,
      };
    }
    return { orderId: payment.order_id, orderNumber: payment.orders.order_code, status: 'confirmed', alreadyProcessed: true };
  }

  await supabase.from('order_status_history').insert({
    order_id: payment.order_id,
    status: 'confirmed',
    note: 'Payment confirmed via Paystack.',
  });

  // Decrement stock for each line item.
  const { data: items } = await supabase.from('order_items').select('dish_id, variant_id, dish_name, variant_summary, quantity').eq('order_id', payment.order_id);
  for (const item of items ?? []) {
    const { error: stockErr } = await supabase.rpc('decrement_stock', {
      p_dish_id: item.dish_id,
      p_variant_id: item.variant_id ?? null,
      p_qty: item.quantity,
    });
    if (stockErr) {
      console.error('Stock decrement failed:', { orderId: payment.order_id, dishId: item.dish_id, detail: stockErr.message });
      await supabase.from('order_status_history').insert({
        order_id: payment.order_id,
        status: 'confirmed',
        note: `Stock could not be decremented for ${item.dish_name} — adjust manually.`,
      });
    }
  }

  // Best-effort in-app notification for signed-in customers.
  if (payment.orders?.user_id) {
    await supabase.from('notifications').insert({
      user_id: payment.orders.user_id,
      title: 'Payment successful',
      body: `Your order ${payment.orders.order_code} has been confirmed and is being processed.`,
    }).catch(() => { /* notifications best-effort */ });
  }

  return { orderId: payment.order_id, orderNumber: payment.orders.order_code, status: 'confirmed' };
}