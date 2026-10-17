# Pistachio Café — Admin

Restaurant admin for Pistachio Café (Spintex, Accra). React + Vite, Supabase, Paystack.

## Stack
- React 18, React Router (lazy-loaded admin routes), @supabase/supabase-js, recharts
- Plain CSS (`src/index.css`, `src/styles/variables.css`)
- Supabase: Postgres, Auth, Realtime, Storage, Edge Functions

## Environment variables
Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://gxidxsximyodjvvzgzmi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never put `VITE_` on the Paystack secret key — it lives only in Edge Function secrets:
```
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxx
supabase secrets set SUPABASE_URL=https://gxidxsximyodjvvzgzmi.supabase.co
supabase secrets set SERVICE_ROLE_KEY=your-service-role-key
```

## Migrations
1. `npm install`
2. `cp .env.example .env` and fill values
3. Apply `supabase/migrations/0001_rename_menu_dishes.sql, 0002_admin.sql, 0003_payments.sql, 0004_storefront.sql, 0005_order_status_enum.sql, 0006_riders_and_helpers.sql` (or run `psql "$DATABASE_URL" -f supabase/ALL_IN_ONE.sql`) (via Supabase SQL Editor or CLI)
4. Seed the database: `psql "$DATABASE_URL" -f supabase/seed.sql`
5. `npm run dev` then `npm run build`

## Edge functions
Deploy after setting secrets:
```
supabase functions deploy create-order
supabase functions deploy paystack-webhook
supabase functions deploy verify-payment
```
Register `paystack-webhook` URL (`https://gxidxsximyodjvvzgzmi.functions.supabase.co/paystack-webhook`) in the Paystack dashboard under Webhooks.

## First staff user
Admin access = Supabase Auth account + a row in the `staff` table. There is no signup UI — add the first staff row directly in Supabase (SQL Editor):

```sql
insert into public.staff (user_id) values ('<auth-users-id>');
```

Then sign in at `/admin/login` with that account.

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview production build


