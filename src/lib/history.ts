import type { WeeklySummary, WorkoutSession } from '../types';

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

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function weekStartOf(date: Date | string): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildWeeklySummary(
  history: WorkoutSession[],
  weekStart: string,
): WeeklySummary {
  const sessions = history.filter(
    (s) => s.finishedAt && weekStartOf(s.finishedAt) === weekStart,
  );
  let totalSets = 0;
  let completedSets = 0;
  let volumeKg = 0;
  for (const s of sessions) {
    for (const e of s.exercises) {
      totalSets += e.sets.length;
      for (const set of e.sets) {
        if (!set.completed) continue;
        completedSets += 1;
        volumeKg += (set.weight ?? 0) * (set.reps ?? 0);
      }
    }
  }
  return {
    weekStart,
    workoutsCount: sessions.length,
    workoutIds: sessions.map((s) => s.workoutId),
    totalSets,
    completedSets,
    volumeKg: Math.round(volumeKg),
    cardioCount: sessions.filter((s) => s.cardioDone).length,
  };
}
