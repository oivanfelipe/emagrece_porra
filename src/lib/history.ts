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

export function hasProgress(session: WorkoutSession): boolean {
  return session.exercises.some((e) => e.sets.some((x) => x.completed));
}

export function completedSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (a, e) => a + e.sets.filter((x) => x.completed).length,
    0,
  );
}

const SAME_WORKOUT_GAP_MS = 6 * 60 * 60 * 1000;

function betterSession(a: WorkoutSession, b: WorkoutSession): WorkoutSession {
  const ca = completedSetCount(a);
  const cb = completedSetCount(b);
  if (ca !== cb) return ca > cb ? a : b;
  if (!!a.finishedAt !== !!b.finishedAt) return a.finishedAt ? a : b;
  return a.startedAt > b.startedAt ? a : b;
}

/**
 * Keeps sessions that have at least one completed set. When the same workout
 * was (re)started several times within a few hours (e.g. the app was reopened
 * mid-workout), only the one with the most progress is kept.
 * Result is sorted oldest -> newest.
 */
export function effectiveSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  const sorted = sessions
    .filter(hasProgress)
    .sort((x, y) => x.startedAt.localeCompare(y.startedAt));
  const kept: WorkoutSession[] = [];
  // Per workout: index in `kept` and start time of its latest cluster.
  const last = new Map<string, { idx: number; start: number }>();
  for (const s of sorted) {
    const start = new Date(s.startedAt).getTime();
    const prev = last.get(s.workoutId);
    if (prev && start - prev.start <= SAME_WORKOUT_GAP_MS) {
      kept[prev.idx] = betterSession(kept[prev.idx], s);
      prev.start = start;
    } else {
      kept.push(s);
      last.set(s.workoutId, { idx: kept.length - 1, start });
    }
  }
  return kept.sort((x, y) => x.startedAt.localeCompare(y.startedAt));
}

export function getLastSessionForWorkout(
  history: WorkoutSession[],
  workoutId: string,
): WorkoutSession | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].workoutId === workoutId && hasProgress(history[i])) {
      return history[i];
    }
  }
  return null;
}

const PENDING_MAX_AGE_MS = 36 * 60 * 60 * 1000;

/** Most recent unfinished session with progress, started in the last 36h. */
export function findPendingSession(
  sessions: WorkoutSession[],
): WorkoutSession | null {
  const now = Date.now();
  let found: WorkoutSession | null = null;
  for (const s of sessions) {
    if (s.finishedAt || !hasProgress(s)) continue;
    if (now - new Date(s.startedAt).getTime() > PENDING_MAX_AGE_MS) continue;
    if (!found || s.startedAt > found.startedAt) found = s;
  }
  return found;
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
  const week = weekStartOf(new Date());
  return effectiveSessions(history).filter(
    (s) => weekStartOf(s.startedAt) === week,
  ).length;
}

export function exerciseHistory(
  history: WorkoutSession[],
  exerciseId: string,
): { date: string; weight: number | null; reps: number | null }[] {
  const rows: { date: string; weight: number | null; reps: number | null }[] =
    [];
  for (const session of effectiveSessions(history)) {
    const log = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!log) continue;
    const best = log.sets
      .filter((s) => s.completed && s.weight != null)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
    if (best) {
      rows.push({
        date: session.finishedAt ?? session.startedAt,
        weight: best.weight,
        reps: best.reps,
      });
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
  sessions: WorkoutSession[],
  weekStart: string,
): WeeklySummary {
  const inWeek = effectiveSessions(sessions).filter(
    (s) => weekStartOf(s.startedAt) === weekStart,
  );
  let totalSets = 0;
  let completedSets = 0;
  let volumeKg = 0;
  for (const s of inWeek) {
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
    workoutsCount: inWeek.length,
    finishedCount: inWeek.filter((s) => s.finishedAt).length,
    workoutIds: inWeek.map((s) => s.workoutId),
    totalSets,
    completedSets,
    volumeKg: Math.round(volumeKg),
    cardioCount: inWeek.filter((s) => s.cardioDone).length,
  };
}

/** One summary per week that has any progress, newest week first. */
export function buildAllWeeklySummaries(
  sessions: WorkoutSession[],
): WeeklySummary[] {
  const weeks = new Set(
    effectiveSessions(sessions).map((s) => weekStartOf(s.startedAt)),
  );
  return [...weeks]
    .sort((a, b) => b.localeCompare(a))
    .map((w) => buildWeeklySummary(sessions, w));
}
