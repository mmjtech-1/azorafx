create type signal_direction as enum ('buy', 'sell');
create type signal_status as enum ('active', 'hit_tp', 'hit_sl', 'expired', 'cancelled');

create table public.signal_configs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  ema_fast integer default 20,
  ema_slow integer default 50,
  ema_trend integer default 200,
  trend_timeframe text default '4H',
  signal_timeframe text default '15m',
  rsi_period integer default 14,
  rsi_overbought integer default 70,
  rsi_oversold integer default 30,
  adx_min integer default 10,
  monitored_pairs text[] default array['EURUSD','XAUUSD','GBPJPY','BTCUSD','USDJPY','GBPUSD'],
  leverage integer default 15,
  risk_per_trade numeric(5,2) default 1.0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.signals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pair text not null,
  direction signal_direction not null,
  timeframe text not null,
  entry_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  confidence_score numeric(5,2),
  ema_fast_val numeric(20,8),
  ema_slow_val numeric(20,8),
  rsi_val numeric(8,4),
  adx_val numeric(8,4),
  trend_direction text,
  status signal_status default 'active',
  reason_no_signal text,
  generated_at timestamptz default now(),
  expires_at timestamptz,
  closed_at timestamptz
);

create index signals_user_pair_idx on signals(user_id, pair);
create index signals_generated_at_idx on signals(generated_at desc);

alter table public.signals enable row level security;
create policy "Users can view own signals" on signals for select using (auth.uid() = user_id);
