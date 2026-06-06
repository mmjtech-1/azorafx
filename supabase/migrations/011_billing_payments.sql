alter table public.profiles add column if not exists is_admin boolean default false;

create table if not exists public.manual_payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  method text not null,
  transaction_id text,
  screenshot_url text,
  amount_usd numeric(8,2),
  amount_pkr numeric(10,2),
  status text default 'pending',
  notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

alter table public.manual_payments enable row level security;
drop policy if exists "Users can insert own payments" on manual_payments;
create policy "Users can insert own payments" on manual_payments for insert with check (auth.uid() = user_id);
drop policy if exists "Users can view own payments" on manual_payments;
create policy "Users can view own payments" on manual_payments for select using (auth.uid() = user_id);

create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  method text,
  amount_usd numeric(8,2),
  status text,
  paypal_subscription_id text,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;
drop policy if exists "Users can view own payments" on payments;
create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);

