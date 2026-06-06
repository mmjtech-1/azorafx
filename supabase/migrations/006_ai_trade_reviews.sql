create table public.trade_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  trade_id uuid references public.trades(id) on delete set null,
  pair text not null,
  direction text not null,
  entry_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  setup_type text,
  user_reasoning text,
  setup_score numeric(4,2),
  risk_management_score numeric(4,2),
  entry_timing_score numeric(4,2),
  discipline_score numeric(4,2),
  overall_score numeric(4,2),
  strengths text[],
  improvements text[],
  verdict text,
  detailed_analysis text,
  market_context text,
  alternative_entry text,
  model_used text default 'claude-sonnet-4-6',
  tokens_used integer,
  created_at timestamptz default now()
);

create index trade_reviews_user_id_idx on trade_reviews(user_id);
create index trade_reviews_created_at_idx on trade_reviews(created_at desc);

alter table public.trade_reviews enable row level security;
create policy "Users can CRUD own reviews" on trade_reviews for all using (auth.uid() = user_id);
