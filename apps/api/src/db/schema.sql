-- ============================================================================
-- Supabase (Postgres) schema for the Stock Research Platform.
-- Run this in the Supabase SQL editor for your free-tier project.
-- Row Level Security (RLS) is enabled on all user-owned tables; the backend
-- uses the service_role key (bypasses RLS) while any direct client access
-- would be restricted to the authenticated user's own rows.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- Mirrors Firebase Auth users for admin/analytics purposes. Populated by the
-- backend on first authenticated request (upsert), keyed by Firebase UID.
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  firebase_uid text unique not null,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists watchlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Firebase UID
  symbol text not null,
  added_at timestamptz not null default now(),
  unique (user_id, symbol)
);
create index if not exists idx_watchlist_user on watchlist_items (user_id);

create table if not exists portfolio_holdings (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Firebase UID
  symbol text not null,
  quantity numeric not null check (quantity > 0),
  average_buy_price numeric not null check (average_buy_price > 0),
  buy_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_portfolio_user on portfolio_holdings (user_id);

create table if not exists price_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null, -- Firebase UID
  symbol text not null,
  target_price numeric not null check (target_price > 0),
  direction text not null check (direction in ('above', 'below')),
  triggered boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_alerts_user on price_alerts (user_id);

create table if not exists api_logs (
  id bigserial primary key,
  method text not null,
  path text not null,
  status_code int not null,
  duration_ms int not null,
  is_error boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_api_logs_created on api_logs (created_at desc);

-- Row Level Security -----------------------------------------------------
alter table watchlist_items enable row level security;
alter table portfolio_holdings enable row level security;
alter table price_alerts enable row level security;
alter table user_profiles enable row level security;

-- The backend always connects with the service_role key, which bypasses RLS.
-- These policies protect the tables in case the anon/public key is ever used
-- directly from a client in the future.
create policy "Users manage their own watchlist" on watchlist_items
  for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

create policy "Users manage their own portfolio" on portfolio_holdings
  for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

create policy "Users manage their own alerts" on price_alerts
  for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

create policy "Users view their own profile" on user_profiles
  for select using (auth.uid()::text = firebase_uid);
