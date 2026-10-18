-- 0004_storefront.sql
-- Pistachio Café — storefront schema (post-migration)
-- Adds delivery zones, dish tags/flags, menu visibility, staff role/active,
-- order landmark/geo/zone/rider, and the track_order security-definer function.

-- ---------------------------------------------------------------------------
-- delivery_zones
-- ---------------------------------------------------------------------------
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric(10,2) not null default 0,
  estimated_minutes integer,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;

create policy "delivery_zones_public_read"
  on public.delivery_zones
  for select
  using (is_visible = true);

-- ---------------------------------------------------------------------------
-- menu: is_visible
-- ---------------------------------------------------------------------------
alter table public.menu
  add column if not exists is_visible boolean not null default true;

-- ---------------------------------------------------------------------------
-- dishes: tags, is_hidden
-- ---------------------------------------------------------------------------
alter table public.dishes
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_hidden boolean not null default false;

-- ---------------------------------------------------------------------------
-- orders: landmark, lat, lng, estimated_minutes, delivery_zone_id, rider_id
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists landmark text,
  add column if not exists lat numeric(10,7),
  add column if not exists lng numeric(10,7),
  add column if not exists estimated_minutes integer,
  add column if not exists delivery_zone_id uuid references public.delivery_zones(id) on delete set null,
  add column if not exists rider_id uuid references public.riders(id) on delete set null;

-- ---------------------------------------------------------------------------
-- riders
-- ---------------------------------------------------------------------------
create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.riders enable row level security;

-- ---------------------------------------------------------------------------
-- staff: role, is_active
-- ---------------------------------------------------------------------------
alter table public.staff
  add column if not exists role text not null default 'staff'
    check (role in ('admin', 'manager', 'staff')),
  add column if not exists is_active boolean not null default true;

-- ---------------------------------------------------------------------------
-- payments: rename reference -> payment_reference
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments' and column_name = 'reference'
  ) then
    alter table public.payments rename reference to payment_reference;
  end if;
end
$$;

create index if not exists payments_payment_reference_idx on public.payments (payment_reference);

-- ---------------------------------------------------------------------------
-- order_status_history
-- ---------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  at timestamptz not null default now()
);

alter table public.order_status_history enable row level security;

create index if not exists order_status_history_order_id_idx on public.order_status_history (order_id);

-- ---------------------------------------------------------------------------
-- track_order(code, phone) — SECURITY DEFINER so anonymous customers can look
-- up their order by code + phone without being able to read the orders table.
-- Returns one jsonb object with the public-safe order fields.
-- ---------------------------------------------------------------------------
create or replace function public.track_order(p_code text, p_phone text)
returns jsonb
language sql
security definer
stable
as $$
  select jsonb_build_object(
    'order_code', o.order_code,
    'status', o.status,
    'payment_status', o.payment_status,
    'fulfilment', o.fulfilment,
    'subtotal', o.subtotal,
    'delivery_fee', o.delivery_fee,
    'total', o.total,
    'address', o.address,
    'landmark', o.landmark,
    'estimated_minutes', o.estimated_minutes,
    'created_at', o.created_at,
    'rider', (
      select jsonb_build_object('name', r.name, 'phone', r.phone)
      from public.riders r
      where r.id = o.rider_id
    ),
    'items', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'name', oi.dish_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        ) order by oi.id
      ), '[]'::jsonb)
      from public.order_items oi
      where oi.order_id = o.id
    ),
    'history', (
      select coalesce(jsonb_agg(
        jsonb_build_object('status', h.status, 'at', h.at) order by h.at
      ), '[]'::jsonb)
      from public.order_status_history h
      where h.order_id = o.id
    )
  )
  from public.orders o
  where o.order_code = p_code
    and o.phone = p_phone
  limit 1;
$$;