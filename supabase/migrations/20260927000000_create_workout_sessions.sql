create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workout_id text not null check (workout_id in ('A', 'B', 'C')),
  started_at timestamptz not null,
  finished_at timestamptz,
  cardio_done boolean not null default false,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_sessions is 'Treino Superior app: one row per workout session (in progress or finished).';

create index workout_sessions_started_at_idx on public.workout_sessions (started_at desc);

alter table public.workout_sessions enable row level security;

create policy "allow_all_workout_sessions"
  on public.workout_sessions
  for all
  to public
  using (true)
  with check (true);
