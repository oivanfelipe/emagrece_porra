create table public.weekly_summaries (
  week_start date primary key,
  workouts_count integer not null default 0,
  workout_ids text[] not null default '{}',
  total_sets integer not null default 0,
  completed_sets integer not null default 0,
  volume_kg numeric not null default 0,
  cardio_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weekly_summaries is 'Treino Superior app: one row per week (week_start = Monday, local time), rebuilt whenever a workout is finished.';

alter table public.weekly_summaries enable row level security;

create policy "allow_all_weekly_summaries"
  on public.weekly_summaries
  for all
  to public
  using (true)
  with check (true);
