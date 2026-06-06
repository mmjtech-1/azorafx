create table public.psychology_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date default current_date unique,
  discipline_score integer check(discipline_score between 0 and 100),
  patience_score integer check(patience_score between 0 and 100),
  fomo_control_score integer check(fomo_control_score between 0 and 100),
  confidence_score integer check(confidence_score between 0 and 100),
  revenge_urge_score integer check(revenge_urge_score between 0 and 100),
  stress_score integer check(stress_score between 0 and 100),
  focus_score integer check(focus_score between 0 and 100),
  overall_score integer generated always as (
    (discipline_score + patience_score + fomo_control_score + confidence_score + focus_score +
     (100 - revenge_urge_score) + (100 - stress_score)) / 7
  ) stored,
  morning_mindset text,
  end_of_day_notes text,
  biggest_mistake text,
  biggest_win text,
  morning_mood emotion_type,
  end_mood emotion_type,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index psych_logs_user_date_idx on psychology_logs(user_id, log_date desc);

alter table public.psychology_logs enable row level security;
create policy "Users can CRUD own psychology logs" on psychology_logs for all using (auth.uid() = user_id);
