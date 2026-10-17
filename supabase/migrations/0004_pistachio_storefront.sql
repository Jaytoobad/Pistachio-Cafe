-- ============================================================================
-- 0004_pistachio_storefront.sql
-- Customer-facing storefront data layer (idempotent, safe to re-apply).
--
-- 1. Orders columns used by checkout/track: email, fulfilment, address, notes,
--    subtotal, delivery_fee. Added with IF NOT EXISTS guards so this is safe
--    whether or not 0003_pistachio_storefront.sql was already applied.
-- 2. Public insert policies on reviews and newsletter_subscribers (guarded so
--    re-applying never duplicates or weakens an existing policy).
-- 3. newsletter_subscribers.email uniqueness (lowercased) for graceful
--    duplicate handling.
-- 4. track_order(code) — SECURITY DEFINER function returning only status +
--    non-sensitive fields for a matching order_code. Created AFTER the orders
--    columns above so column order never breaks the function. Anonymous
--    customers can execute it; the orders table itself is never exposed.
-- ============================================================================

-- 1. Orders columns -----------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'email'
  ) then
    alter table public.orders add column email text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'fulfilment'
  ) then
    alter table public.orders add column fulfilment text not null default 'pickup';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'address'
  ) then
    alter table public.orders add column address text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'notes'
  ) then
    alter table public.orders add column notes text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'subtotal'
  ) then
    alter table public.orders add column subtotal numeric not null default 0;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'delivery_fee'
  ) then
    alter table public.orders add column delivery_fee numeric not null default 0;
  end if;
end $$;

-- 2. RLS + public insert policies --------------------------------------------

alter table public.reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_public_insert'
  ) then
    create policy reviews_public_insert on public.reviews
      for insert to anon, authenticated
      with check (true);
  end if;
end $$;

alter table public.newsletter_subscribers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'newsletter_subscribers' and policyname = 'newsletter_public_insert'
  ) then
    create policy newsletter_public_insert on public.newsletter_subscribers
      for insert to anon, authenticated
      with check (true);
  end if;
end $$;

-- 3. Unique email so duplicates are detected gracefully -----------------------

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

-- 4. Tracking function --------------------------------------------------------

create or replace function public.track_order(code text)
returns table (
  order_code text,
  status text,
  payment_status text,
  fulfilment text,
  total numeric,
  created_at timestamptz,
  customer_name text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    o.order_code,
    o.status,
    o.payment_status,
    o.fulfilment,
    o.total,
    o.created_at,
    o.customer_name
  from public.orders o
  where o.order_code = code
  limit 1;
end;
$$;

revoke all on function public.track_order(text) from public, anon, authenticated;
grant execute on function public.track_order(text) to anon, authenticated, service_role;
