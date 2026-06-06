create type event_impact as enum ('high', 'medium', 'low');

create table public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  event_date date not null,
  event_time time,
  currency text not null,
  impact event_impact not null,
  event_name text not null,
  previous_value text,
  forecast_value text,
  actual_value text,
  beat_forecast boolean,
  source_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_date, currency, event_name, event_time)
);

create index calendar_events_date_idx on calendar_events(event_date);
create index calendar_events_currency_idx on calendar_events(currency);
create index calendar_events_impact_idx on calendar_events(impact);

alter table public.calendar_events enable row level security;
create policy "Authenticated users can read calendar" on calendar_events for select to authenticated using (true);
create policy "Service role can manage calendar" on calendar_events for all to service_role using (true);
