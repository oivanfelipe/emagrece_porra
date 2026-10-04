import { supabase } from './supabase';
import type { WeeklySummary } from '../types';

interface WeeklySummaryRow {
  week_start: string;
  workouts_count: number;
  workout_ids: string[];
  total_sets: number;
  completed_sets: number;
  volume_kg: number;
  cardio_count: number;
}

function fromRow(row: WeeklySummaryRow): WeeklySummary {
  return {
    weekStart: row.week_start,
    workoutsCount: row.workouts_count,
    workoutIds: row.workout_ids,
    totalSets: row.total_sets,
    completedSets: row.completed_sets,
    volumeKg: Number(row.volume_kg),
    cardioCount: row.cardio_count,
  };
}

export async function fetchWeeklySummaries(): Promise<WeeklySummary[]> {
  const { data, error } = await supabase
    .from('weekly_summaries')
    .select('*')
    .order('week_start', { ascending: false });

  if (error) throw error;
  return (data as WeeklySummaryRow[]).map(fromRow);
}

export async function saveWeeklySummary(summary: WeeklySummary): Promise<void> {
  const { error } = await supabase.from('weekly_summaries').upsert(
    {
      week_start: summary.weekStart,
      workouts_count: summary.workoutsCount,
      workout_ids: summary.workoutIds,
      total_sets: summary.totalSets,
      completed_sets: summary.completedSets,
      volume_kg: summary.volumeKg,
      cardio_count: summary.cardioCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'week_start' },
  );

  if (error) throw error;
}
