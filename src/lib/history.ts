import type { WorkoutSession } from '../types';

export function getLastSetLog(
  history: WorkoutSession[],
  exerciseId: string,
): { weight: number | null; reps: number | null } | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const log = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) continue;
    const lastCompleted = [...log.sets].reverse().find((s) => s.completed);
    if (lastCompleted) {
      return { weight: lastCompleted.weight, reps: lastCompleted.reps };
    }
  }
  return null;
}

export function getLastSessionForWorkout(
  history: WorkoutSession[],
  workoutId: string,
): WorkoutSession | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].workoutId === workoutId && history[i].finishedAt) {
      return history[i];
    }
  }
  return null;
}

export function daysAgo(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function formatDaysAgo(iso: string): string {
  const d = daysAgo(iso);
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  return `há ${d} dias`;
}

export function sessionsThisWeek(history: WorkoutSession[]): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return history.filter(
    (s) => s.finishedAt && new Date(s.finishedAt) >= monday,
  ).length;
}

export function exerciseHistory(
  history: WorkoutSession[],
  exerciseId: string,
): { date: string; weight: number | null; reps: number | null }[] {
  const rows: { date: string; weight: number | null; reps: number | null }[] =
    [];
  for (const session of history) {
    if (!session.finishedAt) continue;
    const log = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) continue;
    const best = log.sets
      .filter((s) => s.completed && s.weight != null)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
    if (best) {
      rows.push({ date: session.finishedAt, weight: best.weight, reps: best.reps });
    }
  }
  return rows.reverse();
}
