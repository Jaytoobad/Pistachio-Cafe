-- ============================================================================
-- 0002_pistachio_payments.sql
-- Payments infrastructure for Pistachio Café admin.
--
-- Adds: payments, order_status_history, notifications tables + decrement_stock
-- helper. RLS policies use the is_staff() allowlist from 0001_pistachio_admin.
--
-- NOTE: review column names against your actual schema before applying.
--   - orders: expects order_code, payment_status, paid_at, status, customer_name,
--     phone, email(?), user_id(?), total, created_at
--   - order_items: expects order_id, product_id, variant_id, product_name,
--     quantity, unit_price, subtotal
--   - products: a `stock` numeric column is added here if missing (for stock
--     decrement). product_variants.stock is referenced only when variant_id is
--     set; adjust if your schema differs.
-- ============================================================================

-- --- Payments table ----------------------------------------------------------

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reference text not null unique,
  amount numeric(10,2) not null,
  currency text not null default 'GHS',
  status text not null default 'initialized' check (status in ('initialized','success','failed','abandoned')),
  channel text,
  paystack_raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_reference on public.payments(reference);

alter table public.payments enable row level security;

create policy payments_staff_all on public.payments
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- Order status history ----------------------------------------------------

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_status_history_order on public.order_status_history(order_id);

alter table public.order_status_history enable row level security;

create policy order_status_history_staff_all on public.order_status_history
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- Notifications -----------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);

alter table public.notifications enable row level security;

create policy notifications_staff_all on public.notifications
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --- Stock column on products (if missing) -----------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'stock'
  ) then
    alter table public.products add column stock numeric not null default 0;
  end if;
end $$;

-- --- Safe stock decrement helper --------------------------------------------

create or replace function public.decrement_stock(p_product_id uuid, p_variant_id uuid, p_qty int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_variant_id is not null then
    -- Variant-level stock: adjust if your schema has a product_variants table.
    -- Left as a no-op here to avoid failing on unknown schema; the webhook
    -- leaves a status-history note when stock can't be decremented.
    null;
  else
    update public.products
    set stock = stock - p_qty
    where id = p_product_id and stock >= p_qty;
    if not found then
      raise exception 'Insufficient stock for product %', p_product_id;
    end if;
  end if;
end;
$$;

revoke all on function public.decrement_stock(uuid, uuid, int) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid, uuid, int) to service_role;

-- --- Payment fields are webhook-only (reinforce 0001 guard) ------------------

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'orders_guard_payment_fields'
  ) then
    create trigger orders_guard_payment_fields
      before update on public.orders
      for each row
      execute function public.guard_order_payment_fields();
  end if;
end $$;
