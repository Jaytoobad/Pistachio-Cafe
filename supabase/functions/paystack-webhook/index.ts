// ============================================================================
// EDGE FUNCTION: paystack-webhook  (Pistachio Cafe)
// ============================================================================
// Paystack calls this URL directly (server-to-server) when a transaction's
// status changes. This is the RELIABLE source of truth for payment status -
// customers can close their browser tab before the redirect-based verify
// runs, but the webhook still fires. Both paths call the same fulfilment
// logic, and both are idempotent on payment_reference, so whichever arrives
// first wins safely.
//
// After deploying, register this URL in your Paystack dashboard:
//   Settings -> API Keys & Webhooks -> Webhook URL
//   https://<project-ref>.functions.supabase.co/paystack-webhook
//
// Deploy with:  supabase functions deploy paystack-webhook --no-verify-jwt
//   (--no-verify-jwt because Paystack calls anonymously; we verify the HMAC
//    signature ourselves below.)
// Requires secrets: PAYSTACK_SECRET_KEY, SUPABASE_URL, SERVICE_ROLE_KEY
// ============================================================================

import { verifyAndFulfil } from '../_shared/fulfil-payment.ts';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const PUBLIC_SITE_URL = Deno.env.get('PUBLIC_SITE_URL')?.replace(/\/$/, '') ?? '';

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin')?.replace(/\/$/, '');
  let allowOrigin = PUBLIC_SITE_URL || '*';
  if (origin) {
    try {
      const { protocol, hostname } = new URL(origin);
      const isLocal = protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1');
      const configuredHostname = PUBLIC_SITE_URL ? new URL(PUBLIC_SITE_URL).hostname : '';
      const isProduction = configuredHostname && hostname.replace(/^www\./, '') === configuredHostname.replace(/^www\./, '');
      if (isLocal || isProduction) allowOrigin = origin;
    } catch {
      // use configured fallback
    }
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const rawBody = await req.text();

    // Verify this request genuinely came from Paystack (HMAC SHA512).
    const signature = req.headers.get('x-paystack-signature');
    const expectedSignature = await hmacSha512Hex(PAYSTACK_SECRET_KEY, rawBody);
    if (!signature || !timingSafeEqual(signature, expectedSignature)) {
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response('Invalid payload', { status: 400, headers: corsHeaders });
    }

    if (!event || typeof event !== 'object' || !event.event) {
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (!reference) {
        return new Response('ok', { status: 200, headers: corsHeaders });
      }
      const result = await verifyAndFulfil(String(reference));
      if (result.error) {
        console.warn('Webhook charge.success not fulfilled:', reference, result.error, 'retryable:', result.retryable);
        if (result.retryable) {
          return new Response('Temporary payment processing failure', { status: 500, headers: corsHeaders });
        }
        return new Response('ok', { status: 200, headers: corsHeaders });
      }
    }

    return new Response('ok', { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Temporary webhook processing failure', { status: 500 });
  }
});

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha512Hex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}