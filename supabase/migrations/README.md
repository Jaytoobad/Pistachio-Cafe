# Migration Apply Order

1. 0000_baseline.sql - Documents the current live database state (baseline tables)
2. 0001_rename_menu_dishes.sql - Renames categories->menu and products->dishes with safe, idempotent operations
3. 0002_admin.sql - Admin functionality, RLS policies, settings, storage, etc.
4. 0003_payments.sql - Payments infrastructure
5. 0004_storefront.sql - Customer-facing storefront functionality


## What each file does

### 0000_baseline.sql
- Documents the baseline schema as it exists in the live database
- Uses CREATE TABLE IF NOT EXISTS for categories, products, orders, order_items, reviews, newsletter_subscribers, staff
- Includes indexes and constraints that exist in the baseline

### 0001_rename_menu_dishes.sql
- Safely renames categories to menu and products to dishes using ALTER TABLE ... RENAME
- Renames constraints, indexes, foreign keys, and sequences as needed
- Updates references
- Adds is_featured boolean to dishes with default false
- All operations are guarded with checks (to_regclass, information_schema) for idempotency

### 0002_admin.sql
- Sets up admin functionality including RLS policies
- Creates is_staff() function, settings table
- Enables RLS on all tables with appropriate policies for staff and public access
- Sets up storage bucket and policies for dish images (product-images)
- Sets up realtime publication for orders
- Adds trigger to protect payment fields from non-service-role updates

### 0003_payments.sql
- Creates payments, order_status_history, notifications tables
- Adds stock column to dishes if missing
- Creates decrement_stock helper function
- Sets up payment-related triggers

### 0004_storefront.sql
- Creates track_order() function (SECURITY DEFINER) with proper grants and search_path
- Sets up public insert policies for reviews and newsletter_subscribers
- Adds unique constraint on newsletter_subscribers.email (lowercase)
- Adds storefront-related columns to orders table if missing
