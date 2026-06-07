create type broker_type as enum ('binance', 'bybit', 'okx', 'kucoin', 'gateio', 'exness', 'xm', 'ftmo', 'icmarkets', 'pepperstone', 'fundednext', 'mt4_other', 'mt5_other');
create type account_type as enum ('crypto', 'mt5', 'mt4');
create type sync_status as enum ('active', 'error', 'disconnected', 'syncing');

create table public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  broker broker_type not null,
  account_type account_type not null,
  nickname text,
  api_key_encrypted text,
  api_secret_encrypted text,
  mt_login text,
  mt_password_encrypted text,
  mt_server text,
  metaapi_account_id text,
  account_balance numeric(12,2),
  account_currency text default 'USD',
  account_leverage integer,
  broker_account_id text,
  sync_status sync_status default 'active',
  last_synced_at timestamptz,
  last_error text,
  total_trades_synced integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.connected_accounts enable row level security;
create policy "Users can CRUD own accounts" on connected_accounts for all using (auth.uid() = user_id);

alter table public.trades add column if not exists source text default 'manual';
alter table public.trades add column if not exists broker_trade_id text;
alter table public.trades add column if not exists connected_account_id uuid references connected_accounts(id);
create unique index if not exists trades_broker_id_idx on trades(connected_account_id, broker_trade_id) where broker_trade_id is not null;

