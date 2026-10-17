-- =============================================================================
-- 0004_storefront.sql
-- Customer-facing storefront data layer for Pistachio Cafe
-- =============================================================================

-- 1. track_order(code) - SECURITY DEFINER function
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
as \$\$
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
\$\$;

revoke all on function public.track_order(text) from public, anon, authenticated;
grant execute on function public.track_order(text) to anon, authenticated, service_role;


-- 2. Reviews public insert
alter table public.reviews enable row level security;
do \$\$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_public_insert'
  ) then
    create policy reviews_public_insert on public.reviews
      for insert to anon, authenticated
      with check (true);
  end if;
end \$\$;


-- 3. Newsletter
alter table public.newsletter_subscribers enable row level security;
do \$\$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'newsletter_subscribers' and policyname = 'newsletter_public_insert'
  ) then
    create policy newsletter_public_insert on public.newsletter_subscribers
      for insert to anon, authenticated
      with check (true);
  end if;
end \$\$;
create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));


-- 4. Orders columns if missing
do \$\$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='email') then
    alter table public.orders add column email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='fulfilment') then
    alter table public.orders add column fulfilment text not null default 'pickup';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='address') then
    alter table public.orders add column address text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='notes') then
    alter table public.orders add column notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='subtotal') then
    alter table public.orders add column subtotal numeric not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='delivery_fee') then
    alter table public.orders add column delivery_fee numeric not null default 0;
  end if;
end \$\$;

revoke all on function public.track_order(text) from public, anon, authenticated;
grant execute on function public.track_order(text) to anon, authenticated, service_role;

-- Ensure reviews public insert exists (guarded)
alter table public.reviews enable row level security;
do \$\$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_public_insert') then
    create policy reviews_public_insert on public.reviews for insert to anon, authenticated with check (true);
  end if;
end \$\$;

alter table public.newsletter_subscribers enable row level security;
do \$\$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='newsletter_subscribers' and policyname='newsletter_public_insert') then
    create policy newsletter_public_insert on public.newsletter_subscribers for insert to anon, authenticated with check (true);
  end if;
end \$\$;
create unique index if not exists newsletter_subscribers_email_unique on public.newsletter_subscribers (lower(email));
