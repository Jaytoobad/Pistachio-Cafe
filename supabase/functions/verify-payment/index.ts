// ============================================================================
// EDGE FUNCTION: verify-payment  (Pistachio Cafe)
// ============================================================================
// Called by the React order-confirmation page after Paystack redirects the
// customer back. It does NOT trust the redirect - it asks Paystack directly
// "did this payment_reference actually succeed?" and only then marks the order
// paid. Idempotent: if the order is already paid, it just returns the order.
//
// Deploy with:  supabase functions deploy verify-payment
// Requires secrets: PAYSTACK_SECRET_KEY, SUPABASE_URL, SERVICE_ROLE_KEY
// ============================================================================

import { verifyAndFulfil } from '../_shared/fulfil-payment.ts';

function getCorsHeaders(req: Request) {
  const configured = Deno.env.get('PUBLIC_SITE_URL')?.replace(/\/$/, '');
  const origin = req.headers.get('origin')?.replace(/\/$/, '');
  let allowOrigin = configured || '*';

  if (origin) {
    try {
      const { protocol, hostname } = new URL(origin);
      const isLocal = protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1');
      const configuredHostname = configured ? new URL(configured).hostname : '';
      const isProduction = configuredHostname && hostname.replace(/^www\./, '') === configuredHostname.replace(/^www\./, '');
      if (isLocal || isProduction) {
        allowOrigin = origin;
      }
    } catch {
      // Malformed origin, use configured fallback
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
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request body.' }, 400, corsHeaders);
    }
    const reference = body?.reference;
    if (!reference || typeof reference !== 'string') {
      return json({ error: 'Missing payment reference.' }, 400, corsHeaders);
    }

    const result = await verifyAndFulfil(String(reference));
    if (result.error) {
      if (result.retryable) {
        return json({ error: result.error, pending: true, orderId: result.orderId ?? null }, 202, corsHeaders);
      }
      return json({ error: result.error }, 400, corsHeaders);
    }
    return json({
      orderId: result.orderId ?? null,
      orderNumber: result.orderNumber ?? null,
      status: result.status ?? null,
    }, 200, corsHeaders);
  } catch (err) {
    console.error('verify-payment failed', { name: err?.name, code: err?.code });
    return json({ error: 'Could not verify payment right now. Please try again shortly.' }, 500, corsHeaders);
  }
});