-- =============================================================================
-- 0001_rename_menu_dishes.sql
-- Renames categories -> menu and products -> dishes
-- All operations are idempotent and safe to re-run
-- =============================================================================

-- Rename categories to menu
do \$\$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='categories')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='menu') then
    alter table public.categories rename to menu;
  end if;
end \$\$;

-- Rename menu constraints/indexes if needed
do \$\$
begin
  if exists (select 1 from pg_indexes where schemaname='public' and tablename='menu' and indexname='categories_slug_unique') then
    alter index public.categories_slug_unique rename to menu_slug_unique;
  end if;
end \$\$;

-- Rename products to dishes
do \$\$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='products')
     and not exists (select 1 from information_schema.tables where table_schema='public' and table_name='dishes') then
    alter table public.products rename to dishes;
  end if;
end \$\$;

-- Handle dishes renames
do \$\$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='dishes' and column_name='category_id')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='dishes' and column_name='menu_id') then
    alter table public.dishes rename column category_id to menu_id;
  end if;
  if exists (select 1 from pg_indexes where schemaname='public' and tablename='dishes' and indexname='products_slug_unique') then
    alter index public.products_slug_unique rename to dishes_slug_unique;
  end if;
  if exists (select 1 from pg_indexes where schemaname='public' and tablename='dishes' and indexname='idx_products_category') then
    alter index public.idx_products_category rename to idx_dishes_menu;
  end if;
end \$\$;

-- Add is_featured to dishes if missing
do \$\$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='dishes') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='dishes' and column_name='is_featured') then
      alter table public.dishes add column is_featured boolean not null default false;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='dishes' and column_name='stock') then
      alter table public.dishes add column stock numeric not null default 0;
    end if;
  end if;
end \$\$;
