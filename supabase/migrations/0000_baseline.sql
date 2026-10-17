-- =============================================================================
-- 0000_baseline.sql
-- Baseline schema documenting the current live database state.
-- Uses CREATE TABLE IF NOT EXISTS to be safe and idempotent.
-- =============================================================================

-- Categories (to be renamed to menu in later migrations)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_slug_unique on public.categories (slug);

-- Products (to be renamed to dishes in later migrations)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  stock numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_slug_unique on public.products (slug);
create index if not exists idx_products_category on public.products(category_id);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  user_id uuid,
  customer_name text not null,
  phone text not null,
  email text,
  fulfilment text not null default 'pickup',
  address text,
  notes text,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'pending_payment',
  paid_at timestamptz,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_code on public.orders(order_code);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  variant_id uuid,
  product_name text not null,
  variant_summary text,
  quantity integer not null default 1,
  unit_price numeric not null,
  subtotal numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  user_email text,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_approved on public.reviews(is_approved);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_unique on public.newsletter_subscribers (lower(email));

-- Staff
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);
