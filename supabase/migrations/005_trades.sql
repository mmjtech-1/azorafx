create type trade_direction as enum ('long', 'short');
create type trade_outcome as enum ('win', 'loss', 'breakeven', 'open');
create type trade_session as enum ('asian', 'london', 'new_york', 'overlap', 'pre_market');
create type trade_setup as enum ('ema_crossover', 'structure_break', 'ob_retest', 'news_trade', 'supply_demand', 'fib_retracement', 'trendline_break', 'other');
create type emotion_type as enum ('focused', 'neutral', 'anxious', 'fomo', 'overconfident', 'frustrated', 'calm', 'excited');

create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pair text not null,
  direction trade_direction not null,
  session trade_session,
  setup_type trade_setup default 'other',
  entry_price numeric(20,8) not null,
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  exit_price numeric(20,8),
  lot_size numeric(10,4),
  risk_percent numeric(5,2),
  risk_amount numeric(12,2),
  pnl numeric(12,2),
  pnl_percent numeric(8,4),
  risk_reward numeric(8,4),
  outcome trade_outcome default 'open',
  pre_emotion emotion_type,
  post_emotion emotion_type,
  notes text,
  mistakes text,
  lessons text,
  screenshot_urls text[],
  tags text[],
  opened_at timestamptz default now(),
  closed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index trades_user_id_idx on trades(user_id);
create index trades_opened_at_idx on trades(opened_at desc);
create index trades_pair_idx on trades(pair);
create index trades_outcome_idx on trades(outcome);

alter table public.trades enable row level security;
create policy "Users can CRUD own trades" on trades for all using (auth.uid() = user_id);
