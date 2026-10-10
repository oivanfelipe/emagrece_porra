alter table public.weekly_summaries
  add column finished_count integer not null default 0;

comment on column public.weekly_summaries.finished_count is 'Workouts of the week that were explicitly finished (workouts_count counts every workout with at least one completed set).';
