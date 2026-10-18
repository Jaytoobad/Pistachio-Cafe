-- 0001_rename_menu_dishes.sql
-- Pistachio Cafe — rename categories -> menu, products -> dishes
create table if not exists public.menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references public.menu(id) on delete cascade,
  name text not null,
  slug text,
  description text,
  price numeric(10,2) not null default 0,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_hidden boolean not null default false,
  tags text[] not null default '{}',
  stock numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu enable row level security;
alter table public.dishes enable row level security;

create policy "menu_public_read" on public.menu for select using (is_visible = true);
create policy "dishes_public_read" on public.dishes for select using (is_available = true and is_hidden = false);