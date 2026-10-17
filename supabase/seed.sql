-- Pistachio Cafe seed.sql
-- Idempotent seed data for a fresh database. Run after ALL_IN_ONE.sql:
--   psql "$DATABASE_URL" -f supabase/seed.sql
-- Safe to re-run: uses ON CONFLICT DO NOTHING / upserts.

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------
insert into public.settings (id, is_accepting_orders, delivery_enabled, delivery_fee,
  weekday_open, weekday_close, weekend_open, weekend_close,
  contact_phone, address, announcement_banner)
values (
  1, true, true, 25,
  '08:00', '23:00', '08:00', '00:00',
  '+233 00 000 0000', 'Spintex Road, Accra', ''
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Delivery zones (Spintex / Accra)
-- ---------------------------------------------------------------------------
insert into public.delivery_zones (name, fee, estimated_minutes, is_visible, sort_order) values
  ('Spintex', 0, 20, true, 0),
  ('Tema', 25, 35, true, 1),
  ('Airport', 20, 30, true, 2),
  ('Labadi', 30, 40, true, 3),
  ('Out of zone', 9999, 60, false, 99)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Menu sections
-- ---------------------------------------------------------------------------
insert into public.menu (id, name, slug, sort_order, is_visible) values
  ('m-wraps', 'Wraps & Sandwiches', 'wraps-sandwiches', 0, true),
  ('m-waffles', 'Waffles & Desserts', 'waffles-desserts', 1, true),
  ('m-icecream', 'Ice Cream', 'ice-cream', 2, true),
  ('m-drinks', 'Drinks & Coffee', 'drinks-coffee', 3, true),
  ('m-shisha', 'Shisha Combos', 'shisha-combos', 4, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Dishes (subset — full menu is managed from the admin panel)
-- ---------------------------------------------------------------------------
insert into public.dishes (id, menu_id, name, slug, description, price, image_url, is_available, is_featured, is_hidden, tags, stock, sort_order) values
  ('d-espresso', 'm-drinks', 'Espresso', 'espresso', 'Single shot of bold espresso.', 18, null, true, false, false, '{}', 100, 0),
  ('d-cappuccino', 'm-drinks', 'Cappuccino', 'cappuccino', 'Espresso with steamed milk foam.', 24, null, true, false, false, '{}', 100, 1),
  ('d-latte', 'm-drinks', 'Latte', 'latte', 'Smooth espresso with silky steamed milk.', 26, null, true, true, false, '{}', 100, 2),
  ('d-shisha-classic', 'm-shisha', 'Shisha Combo Classic', 'shisha-combo-classic', 'Classic flavour with premium coal.', 90, null, true, true, false, '{}', 50, 0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Riders (sample — real riders added by staff)
-- ---------------------------------------------------------------------------
insert into public.riders (id, name, phone, is_active) values
  ('r-1', 'Kwame Asante', '+233 24 000 0001', true),
  ('r-2', 'Ama Serwaa', '+233 25 000 0002', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- First staff user
-- Replace the UUID below with the real auth.users id before running.
-- ---------------------------------------------------------------------------
-- insert into public.staff (user_id, role, is_active)
-- values ('<auth-users-id>', 'admin', true)
-- on conflict (user_id) do nothing;