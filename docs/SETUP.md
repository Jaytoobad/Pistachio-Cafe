# Pistachio Cafe — Setup

Restaurant admin + storefront for Pistachio Cafe (Spintex, Accra).
React + Vite, Supabase (Postgres, Auth, Realtime, Storage, Edge Functions), Paystack.

## Stack
- React 18, React Router (lazy-loaded admin routes), @supabase/supabase-js, recharts
- Plain CSS (`src/index.css`, `src/styles/variables.css`)
- Supabase: Postgres, Auth, Realtime, Storage, Edge Functions

## Environment variables
Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://gxidxsximyodjvvzgzmi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Never put `VITE_` on the Paystack secret key — it lives only in Edge Function secrets:

```
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxx
supabase secrets set SUPABASE_URL=https://gxidxsximyodjvvzgzmi.supabase.co
supabase secrets set SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set PUBLIC_SITE_URL=https://yourdomain.com
```

## Migrations
1. `npm install`
2. `cp .env.example .env` and fill values
3. Apply the migrations in order (via Supabase SQL Editor or CLI):
   - `supabase/migrations/0001_rename_menu_dishes.sql`
   - `supabase/migrations/0002_admin.sql`
   - `supabase/migrations/0003_payments.sql`
   - `supabase/migrations/0004_storefront.sql`
   - `supabase/migrations/0005_order_status_enum.sql`
   - `supabase/migrations/0006_riders_and_helpers.sql`
   Or run the all-in-one script: `psql "$DATABASE_URL" -f supabase/ALL_IN_ONE.sql`
4. Seed the database: `psql "$DATABASE_URL" -f supabase/seed.sql`
5. `npm run dev` then `npm run build`

## Edge functions
Deploy after setting secrets:

```
supabase functions deploy create-order
supabase functions deploy paystack-webhook --no-verify-jwt
supabase functions deploy verify-payment
```

Register `paystack-webhook` URL (`https://gxidxsximyodjvvzgzmi.functions.supabase.co/paystack-webhook`) in the Paystack dashboard under Webhooks.

## First staff user
Admin access = Supabase Auth account + a row in the `staff` table. There is no signup UI — add the first staff row directly in Supabase (SQL Editor):

```sql
insert into public.staff (user_id, role, is_active) values ('<auth-users-id>', 'admin', true);
```

Then sign in at `/admin/login` with that account.

## Order status lifecycle
received → confirmed → preparing → ready → out_for_delivery → delivered → completed
`cancelled` is terminal. Payment success moves an order from `received` to `confirmed`.

## Tracking
Customers track by order code + phone via the `track_order(code, phone)` SECURITY DEFINER function. The customer side polls every 10-15 seconds and never uses realtime.

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Vercel
`vercel.json` rewrites all routes to `index.html` (SPA fallback).