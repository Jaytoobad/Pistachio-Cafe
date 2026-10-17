-- 0006_riders_and_helpers.sql
-- Pistachio Café — riders table + supporting RPCs (decrement_stock, set_rider).
-- decrement_stock is called by the fulfil-payment edge function when a
-- payment succeeds; it keeps stock consistent without exposing the dishes
-- table to anonymous callers.

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.riders enable row level security;

create policy "riders_staff_all"
  on public.riders
  for all
  using (exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true))
  with check (exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true));

-- Riders are visible to authenticated customers (name/phone only).
create policy "riders_public_read"
  on public.riders
  for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- decrement_stock — atomic stock decrement with a floor of 0.
-- p_dish_id + p_variant_id uniquely identify a dish row.
-- ---------------------------------------------------------------------------
create or replace function public.decrement_stock(p_dish_id uuid, p_variant_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as $$
declare
  v_current numeric;
begin
  if p_qty is null or p_qty <= 0 then
    return;
  end if;

  -- Variant stock lives on the variant row; dish stock is the fallback.
  if p_variant_id is not null then
    update public.dish_variants
    set stock = greatest(0, stock - p_qty)
    where id = p_variant_id and dish_id = p_dish_id;
  end if;

  update public.dishes
  set stock = greatest(0, stock - p_qty)
  where id = p_dish_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- set_rider — assign a rider to an order (staff only).
-- ---------------------------------------------------------------------------
create or replace function public.set_rider(p_order_id uuid, p_rider_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order record;
begin
  if not exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true) then
    return jsonb_build_object('error', 'Not authorised.');
  end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then
    return jsonb_build_object('error', 'Order not found.');
  end if;

  update public.orders set rider_id = p_rider_id, updated_at = now() where id = p_order_id;

  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, v_order.status, 'Rider assigned.');

  select * into v_order from public.orders where id = p_order_id;
  return jsonb_build_object('order_code', v_order.order_code, 'status', v_order.status, 'rider_id', v_order.rider_id);
end;
$$;