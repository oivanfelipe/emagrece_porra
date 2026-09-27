import { supabase } from './supabase';
import type { WorkoutSession } from '../types';

interface WorkoutSessionRow {
  id: string;
  workout_id: string;
  started_at: string;
  finished_at: string | null;
  cardio_done: boolean;
  exercises: WorkoutSession['exercises'];
}

function fromRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    workoutId: row.workout_id as WorkoutSession['workoutId'],
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    cardioDone: row.cardio_done,
    exercises: row.exercises,
  };
}

function toRow(session: WorkoutSession) {
  return {
    id: session.id,
    workout_id: session.workoutId,
    started_at: session.startedAt,
    finished_at: session.finishedAt,
    cardio_done: session.cardioDone,
    exercises: session.exercises,
  };
}

export async function fetchFinishedHistory(): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: true });

  if (error) throw error;
  return (data as WorkoutSessionRow[]).map(fromRow);
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .upsert(toRow(session), { onConflict: 'id' });

  if (error) throw error;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
