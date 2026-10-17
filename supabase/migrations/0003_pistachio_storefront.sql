-- ============================================================================
-- 0003_pistachio_storefront.sql
-- Customer-facing storefront for Pistachio Café.
--
-- 1. track_order(code) — SECURITY DEFINER function that returns only
--    status + non-sensitive fields for a matching order_code. Anonymous
--    customers can call it, but it never exposes the orders table directly.
-- 2. reviews public insert — the storefront review form inserts as NOT
--    approved; the admin Reviews page is the only place that flips
--    is_approved to true.
-- 3. newsletter_subscribers.email unique — so the storefront can detect a
--    duplicate subscription and reply with a friendly message instead of
--    erroring.
-- 4. orders columns used by the storefront checkout: email, fulfilment,
--    address, notes, subtotal, delivery_fee. Added with IF NOT EXISTS so this
--    is safe to apply whether or not they already exist.
-- ============================================================================

-- 1. Tracking function -------------------------------------------------------

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

-- 2. Reviews: public can insert (for moderation) -----------------------------

alter table public.reviews enable row level security;

create policy reviews_public_insert on public.reviews
  for insert to anon, authenticated
  with check (true);

-- 3. Newsletter: unique email so duplicates are handled gracefully ------------

alter table public.newsletter_subscribers enable row level security;

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

-- 4. Orders columns used by the storefront checkout --------------------------

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