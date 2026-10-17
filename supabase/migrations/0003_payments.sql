-- 0003_payments.sql
-- Pistachio Cafe — payments + orders + order_items + order_status_history
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,
  fulfilment text not null default 'pickup' check (fulfilment in ('pickup', 'delivery')),
  address text,
  landmark text,
  lat numeric(10,7),
  lng numeric(10,7),
  estimated_minutes integer,
  delivery_zone_id uuid,
  rider_id uuid,
  notes text,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'received' check (status in (
    'received', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'completed', 'cancelled'
  )),
  payment_status text not null default 'pending_payment' check (payment_status in (
    'pending_payment', 'paid', 'failed', 'refunded'
  )),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid references public.dishes(id) on delete set null,
  variant_id uuid,
  dish_name text not null,
  variant_summary text,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_reference text not null unique,
  amount numeric(10,2) not null default 0,
  currency text not null default 'GHS',
  channel text,
  status text not null default 'initialized' check (status in ('initialized', 'success', 'failed')),
  paystack_raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in (
    'received', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'completed', 'cancelled'
  )),
  note text,
  at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.order_status_history enable row level security;

create index if not exists orders_order_code_idx on public.orders (order_code);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists payments_payment_reference_idx on public.payments (payment_reference);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_status_history_order_id_idx on public.order_status_history (order_id);