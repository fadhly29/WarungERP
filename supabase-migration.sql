-- Supabase Migration
-- Run in Supabase SQL Editor

-- Enable UUID
create extension if not exists "uuid-ossp";

-- Tenants
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- Users (extends auth.users)
create table users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  tenant_id uuid references tenants on delete cascade,
  role text default 'owner' check (role in ('owner', 'staff')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- Ingredients
create table ingredients (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  name text not null,
  unit text not null,
  current_price numeric(12,2) not null default 0,
  supplier text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create index idx_ingredients_tenant on ingredients(tenant_id) where deleted_at is null;

-- Ingredient Price History
create table ingredient_price_history (
  id uuid primary key default uuid_generate_v4(),
  ingredient_id uuid not null references ingredients on delete cascade,
  price numeric(12,2) not null,
  recorded_at timestamp with time zone default now()
);

-- Recipes
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  name text not null,
  hpp numeric(12,2) not null default 0,
  yield_qty numeric(10,2) not null default 1,
  yield_unit text not null default 'pcs',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create index idx_recipes_tenant on recipes(tenant_id) where deleted_at is null;

-- Recipe Items
create table recipe_items (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes on delete cascade,
  ingredient_id uuid not null references ingredients on delete cascade,
  ingredient_name text not null,
  qty numeric(10,2) not null,
  unit text not null,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) not null
);

-- Recipe Versions
create table recipe_versions (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes on delete cascade,
  version integer not null default 1,
  data jsonb not null default '{}',
  created_at timestamp with time zone default now()
);

-- Menus
create table menus (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  name text not null,
  recipe_id uuid not null references recipes on delete cascade,
  recipe_name text not null,
  hpp numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  margin numeric(12,2) not null default 0,
  margin_percent numeric(5,2) not null default 0,
  category text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create index idx_menus_tenant on menus(tenant_id) where deleted_at is null;

-- Inventory
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  ingredient_id uuid not null references ingredients on delete cascade unique,
  ingredient_name text not null,
  stock numeric(10,2) not null default 0,
  unit text not null,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create index idx_inventory_tenant on inventory(tenant_id) where deleted_at is null;

-- Purchase Orders
create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  po_number text not null,
  supplier text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'received')),
  total numeric(12,2) not null default 0,
  notes text,
  is_public boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

create index idx_po_tenant on purchase_orders(tenant_id) where deleted_at is null;

-- PO Items
create table purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid not null references purchase_orders on delete cascade,
  ingredient_id uuid not null references ingredients on delete cascade,
  ingredient_name text not null,
  qty numeric(10,2) not null,
  unit text not null,
  price numeric(12,2) not null,
  total numeric(12,2) not null
);

-- Marketplace Sync Logs
create table marketplace_sync_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  platform text not null,
  status text not null check (status in ('success', 'failed')),
  synced_at timestamp with time zone default now()
);

-- Sales Reports
create table sales_reports (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  menu_id uuid not null references menus on delete cascade,
  menu_name text not null,
  qty integer not null default 0,
  revenue numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  date date not null default current_date,
  created_at timestamp with time zone default now()
);

-- Profit Reports
create table profit_reports (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants on delete cascade,
  total_revenue numeric(12,2) not null default 0,
  total_profit numeric(12,2) not null default 0,
  avg_margin numeric(5,2) not null default 0,
  period text not null,
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table tenants enable row level security;
alter table users enable row level security;
alter table ingredients enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;
alter table menus enable row level security;
alter table inventory enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table sales_reports enable row level security;
alter table profit_reports enable row level security;

-- Helper function for tenant scoping
create or replace function get_tenant_id()
returns uuid as $$
begin
  return (select tenant_id from users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

-- Tenant-scoped policies
create policy "Users can read own tenant data" on ingredients
  for select using (tenant_id = get_tenant_id() and deleted_at is null);
create policy "Users can insert own tenant data" on ingredients
  for insert with check (tenant_id = get_tenant_id());
create policy "Users can update own tenant data" on ingredients
  for update using (tenant_id = get_tenant_id());
create policy "Users can soft delete own tenant data" on ingredients
  for update using (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on recipes
  for select using (tenant_id = get_tenant_id() and deleted_at is null);
create policy "Tenant scoped insert" on recipes
  for insert with check (tenant_id = get_tenant_id());
create policy "Tenant scoped update" on recipes
  for update using (tenant_id = get_tenant_id());
create policy "Tenant scoped delete" on recipes
  for update using (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on menus
  for select using (tenant_id = get_tenant_id() and deleted_at is null);
create policy "Tenant scoped insert" on menus
  for insert with check (tenant_id = get_tenant_id());
create policy "Tenant scoped update" on menus
  for update using (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on inventory
  for select using (tenant_id = get_tenant_id() and deleted_at is null);
create policy "Tenant scoped insert" on inventory
  for insert with check (tenant_id = get_tenant_id());
create policy "Tenant scoped update" on inventory
  for update using (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on purchase_orders
  for select using (tenant_id = get_tenant_id() and deleted_at is null);
create policy "Tenant scoped insert" on purchase_orders
  for insert with check (tenant_id = get_tenant_id());
create policy "Tenant scoped update" on purchase_orders
  for update using (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on sales_reports
  for select using (tenant_id = get_tenant_id());
create policy "Tenant scoped insert" on sales_reports
  for insert with check (tenant_id = get_tenant_id());

create policy "Tenant scoped read" on profit_reports
  for select using (tenant_id = get_tenant_id());
create policy "Tenant scoped insert" on profit_reports
  for insert with check (tenant_id = get_tenant_id());

-- Allow public access to public POs
create policy "Public can view public POs" on purchase_orders
  for select using (is_public = true);
