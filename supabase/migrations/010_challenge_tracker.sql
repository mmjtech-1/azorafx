create type challenge_phase as enum ('phase1', 'phase2', 'funded', 'failed', 'passed');
create type prop_firm as enum ('ftmo', 'fundednext', 'apex', 'the5ers', 'alpha_capital', 'myforexfunds', 'e8funding', 'topstep', 'other');

create table public.challenges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  firm_name prop_firm default 'other',
  custom_firm_name text,
  account_size numeric(12,2) not null,
  phase challenge_phase default 'phase1',
  profit_target_percent numeric(5,2) not null,
  daily_loss_limit_percent numeric(5,2) not null,
  max_drawdown_percent numeric(5,2) not null,
  min_trading_days integer default 0,
  max_trading_days integer,
  no_weekend_holding boolean default false,
  no_news_trading boolean default false,
  max_lot_size numeric(10,4),
  profit_target_amount numeric(12,2) generated always as (account_size * profit_target_percent / 100) stored,
  daily_loss_limit_amount numeric(12,2) generated always as (account_size * daily_loss_limit_percent / 100) stored,
  max_drawdown_amount numeric(12,2) generated always as (account_size * max_drawdown_percent / 100) stored,
  current_balance numeric(12,2),
  current_pnl numeric(12,2) default 0,
  highest_balance numeric(12,2),
  days_traded integer default 0,
  status challenge_phase default 'phase1',
  started_at date default current_date,
  deadline_date date,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.challenge_snapshots (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  snapshot_date date not null,
  balance numeric(12,2),
  daily_pnl numeric(12,2),
  daily_loss_used numeric(12,2),
  drawdown_used numeric(12,2),
  trades_count integer,
  created_at timestamptz default now(),
  unique(challenge_id, snapshot_date)
);

alter table public.challenges enable row level security;
create policy "Users can CRUD own challenges" on challenges for all using (auth.uid() = user_id);

alter table public.challenge_snapshots enable row level security;
create policy "Users can CRUD own snapshots" on challenge_snapshots for all using (auth.uid() = user_id);
