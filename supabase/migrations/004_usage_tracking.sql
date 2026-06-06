create table public.usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month_year text not null,
  trades_logged integer default 0,
  ai_reviews_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, month_year)
);

alter table public.usage_logs enable row level security;
create policy "Users can view own usage" on usage_logs for select using (auth.uid() = user_id);
create policy "Users can update own usage" on usage_logs for update using (auth.uid() = user_id);
create policy "Users can insert own usage" on usage_logs for insert with check (auth.uid() = user_id);
