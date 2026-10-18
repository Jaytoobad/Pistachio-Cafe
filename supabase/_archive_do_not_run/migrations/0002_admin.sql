-- 0002_admin.sql
-- Pistachio Cafe — staff + admin infrastructure
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  role text not null default 'staff' check (role in ('admin', 'manager', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

create policy "staff_self_read" on public.staff for select using (user_id = auth.uid());
create policy "staff_admin_all" on public.staff for all using (
  exists (select 1 from public.staff s where s.user_id = auth.uid() and s.role = 'admin' and s.is_active = true)
) with check (
  exists (select 1 from public.staff s where s.user_id = auth.uid() and s.role = 'admin' and s.is_active = true)
);

create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true);
$$;

-- ---------------------------------------------------------------------------
-- Settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  is_accepting_orders boolean not null default true,
  delivery_enabled boolean not null default true,
  delivery_fee numeric(10,2) not null default 0,
  weekday_open text,
  weekday_close text,
  weekend_open text,
  weekend_close text,
  contact_phone text,
  address text,
  announcement_banner text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings_public_read" on public.settings for select using (true);
create policy "settings_staff_write" on public.settings for all using (
  exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true)
) with check (
  exists (select 1 from public.staff s where s.user_id = auth.uid() and s.is_active = true)
);