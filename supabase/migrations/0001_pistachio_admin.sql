-- ============================================================================
-- 0001_pistachio_admin.sql
-- Admin security layer for Pistachio Café.
--
-- 1. is_staff() — security definer function read from the staff allowlist.
-- 2. settings table — single row, public read, staff update.
-- 3. RLS policies on orders, order_items, products, categories, reviews,
--    newsletter_subscribers, settings, staff (staff access via is_staff()).
-- 4. product-images storage bucket — public read, staff write.
-- 5. Realtime publication for the orders table.
-- 6. Trigger: payment_status / paid_at can only change via service_role
--    (i.e. the Paystack webhook), never from the admin UI.
-- ============================================================================

-- 1. Staff membership check ---------------------------------------------------

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff where user_id = auth.uid()
  );
$$;

grant execute on function public.is_staff() to anon, authenticated, service_role;

-- 2. Settings table (single row) ---------------------------------------------

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  is_accepting_orders boolean not null default true,
  delivery_enabled boolean not null default true,
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  weekday_open time not null default '08:00',
  weekday_close time not null default '23:00',
  weekend_open time not null default '08:00',
  weekend_close time not null default '00:00',
  contact_phone text,
  address text,
  announcement_banner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

create policy settings_public_select on public.settings
  for select to anon, authenticated
  using (true);

create policy settings_staff_update on public.settings
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- 3. RLS on existing tables ---------------------------------------------------

-- Orders: staff read and update (status changes, cancels). Inserts come from
-- the create-order Edge Function using service_role, so no public/staff API
-- insert policy is needed here.
alter table public.orders enable row level security;

create policy orders_staff_select on public.orders
  for select to authenticated
  using (public.is_staff());

create policy orders_staff_update on public.orders
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy orders_staff_delete on public.orders
  for delete to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Order items: staff only.
alter table public.order_items enable row level security;

create policy order_items_staff_all on public.order_items
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Products: public read, staff write.
alter table public.products enable row level security;

create policy products_public_select on public.products
  for select to anon, authenticated
  using (true);

create policy products_staff_all on public.products
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Categories: public read, staff write.
alter table public.categories enable row level security;

create policy categories_public_select on public.categories
  for select to anon, authenticated
  using (true);

create policy categories_staff_all on public.categories
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Reviews: public sees approved rows only; staff manage all.
alter table public.reviews enable row level security;

create policy reviews_public_select_approved on public.reviews
  for select to anon, authenticated
  using (is_approved = true);

create policy reviews_staff_all on public.reviews
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Newsletter subscribers: public can sign up; staff read/delete.
alter table public.newsletter_subscribers enable row level security;

create policy newsletter_public_insert on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

create policy newsletter_staff_select on public.newsletter_subscribers
  for select to authenticated
  using (public.is_staff());

create policy newsletter_staff_delete on public.newsletter_subscribers
  for delete to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Staff allowlist: a user can see their own row; staff see all rows.
-- No insert/update/delete via the API — staff rows are added in Supabase.
alter table public.staff enable row level security;

create policy staff_select on public.staff
  for select to authenticated
  using (auth.uid() = user_id or public.is_staff());

-- 4. Payment fields are webhook-only -----------------------------------------

create or replace function public.guard_order_payment_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if (new.payment_status is distinct from old.payment_status)
     or (new.paid_at is distinct from old.paid_at) then
    raise exception 'Payment status and paid_at are managed by the Paystack webhook only.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_order_payment_fields() from public, anon, authenticated;

drop trigger if exists orders_guard_payment_fields on public.orders;
create trigger orders_guard_payment_fields
  before update on public.orders
  for each row
  execute function public.guard_order_payment_fields();

-- 5. Storage bucket: product-images ------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy product_images_public_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy product_images_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());

create policy product_images_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

create policy product_images_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_staff());

-- 6. Realtime for live orders board ------------------------------------------

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables pt
    join pg_publication p on p.oid = pt.pubid
    where p.pubname = 'supabase_realtime'
      and pt.schemaname = 'public'
      and pt.tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
