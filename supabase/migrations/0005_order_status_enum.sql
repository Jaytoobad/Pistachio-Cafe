-- 0005_order_status_enum.sql
-- Pistachio Café — canonical order status values.
-- Replaces the legacy 'pending'/'paid'/'completed'/'cancelled' set with the
-- full lifecycle: received, confirmed, preparing, ready, out_for_delivery,
-- delivered, completed, cancelled.
--
-- This migration does NOT rewrite existing rows — it only documents the
-- canonical values and adds a CHECK constraint on orders.status so the
-- database itself rejects anything outside the set.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'received',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'completed',
    'cancelled'
  ));

-- order_status_history.status shares the same canonical set.
alter table public.order_status_history
  drop constraint if exists order_status_history_status_check;

alter table public.order_status_history
  add constraint order_status_history_status_check
  check (status in (
    'received',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'completed',
    'cancelled'
  ));

-- payments.status canonical values.
alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('initialized', 'success', 'failed'));

-- payments.payment_status canonical values.
alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending_payment', 'paid', 'failed', 'refunded'));

-- ---------------------------------------------------------------------------
-- Helper RPCs for staff to advance an order through the lifecycle.
-- These are the ONLY write paths an admin client uses; they insert a history
-- row and are idempotent (no-op when the order is already at/after the target).
-- ---------------------------------------------------------------------------

create or replace function public.advance_order(p_order_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_current text;
  v_rank int;
  v_target int;
  v_order record;
begin
  if not exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true) then
    return jsonb_build_object('error', 'Not authorised.');
  end if;

  select status into v_current from public.orders where id = p_order_id;
  if not found then
    return jsonb_build_object('error', 'Order not found.');
  end if;

  v_rank := array_position(array['received','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled'], v_current);
  v_target := array_position(array['received','confirmed','preparing','ready','out_for_delivery','delivered','completed','cancelled'], p_status);

  if v_target is null then
    return jsonb_build_object('error', 'Invalid status.');
  end if;

  -- Cannot move backwards; cancelled is terminal.
  if v_current = 'cancelled' then
    return jsonb_build_object('error', 'Order is already cancelled.');
  end if;

  update public.orders set status = p_status, updated_at = now() where id = p_order_id and status <> p_status;

  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, p_status, 'Status updated by staff.');

  select * into v_order from public.orders where id = p_order_id;
  return jsonb_build_object('order_code', v_order.order_code, 'status', v_order.status, 'payment_status', v_order.payment_status);
end;
$$;

create or replace function public.cancel_order(p_order_id uuid)
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

  if v_order.status = 'cancelled' then
    return jsonb_build_object('order_code', v_order.order_code, 'status', 'cancelled', 'already', true);
  end if;

  update public.orders set status = 'cancelled', updated_at = now() where id = p_order_id;

  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, 'cancelled', 'Order cancelled by staff.');

  return jsonb_build_object('order_code', v_order.order_code, 'status', 'cancelled');
end;
$$;