import { supabase } from './supabase';
import type { WeeklySummary } from '../types';

function toRow(summary: WeeklySummary) {
  return {
    week_start: summary.weekStart,
    workouts_count: summary.workoutsCount,
    finished_count: summary.finishedCount,
    workout_ids: summary.workoutIds,
    total_sets: summary.totalSets,
    completed_sets: summary.completedSets,
    volume_kg: summary.volumeKg,
    cardio_count: summary.cardioCount,
    updated_at: new Date().toISOString(),
  };
}

export async function saveWeeklySummaries(
  summaries: WeeklySummary[],
): Promise<void> {
  if (summaries.length === 0) return;
  const { error } = await supabase
    .from('weekly_summaries')
    .upsert(summaries.map(toRow), { onConflict: 'week_start' });

  if (error) throw error;
}
