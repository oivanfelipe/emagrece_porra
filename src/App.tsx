import { useEffect, useMemo, useRef, useState } from 'react';
import { History } from './components/History';
import { Home } from './components/Home';
import { WorkoutSession } from './components/WorkoutSession';
import { getWorkout } from './data/workouts';
import {
  buildAllWeeklySummaries,
  buildWeeklySummary,
  effectiveSessions,
  findPendingSession,
  hasProgress,
  weekStartOf,
} from './lib/history';
import {
  deleteSession,
  fetchAllSessions,
  saveSession,
} from './lib/workoutSessionsApi';
import { saveWeeklySummaries } from './lib/weeklySummariesApi';
import type { WorkoutSession as WorkoutSessionT } from './types';

type View = { name: 'home' } | { name: 'history' } | { name: 'session' };

function createSession(workoutId: string): WorkoutSessionT | null {
  const workout = getWorkout(workoutId);
  if (!workout) return null;
  return {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    cardioDone: false,
    exercises: workout.exercises.map((e) => ({
      exerciseId: e.id,
      sets: Array.from({ length: e.sets }, () => ({
        weight: null,
        reps: null,
        completed: false,
      })),
    })),
  };
}

function upsertById(
  list: WorkoutSessionT[],
  session: WorkoutSessionT,
): WorkoutSessionT[] {
  return [...list.filter((s) => s.id !== session.id), session];
}

function App() {
  // Every session stored in the database (finished or not), except the one
  // being edited right now, which lives in `activeSession`.
  const [sessions, setSessions] = useState<WorkoutSessionT[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSessionT | null>(
    null,
  );
  const [view, setView] = useState<View>({ name: 'home' });
  const saveTimeout = useRef<number | undefined>(undefined);
  const sessionsRef = useRef<WorkoutSessionT[]>([]);

  const allSessions = useMemo(
    () => (activeSession ? upsertById(sessions, activeSession) : sessions),
    [sessions, activeSession],
  );
  const history = useMemo(() => effectiveSessions(sessions), [sessions]);
  const weeks = useMemo(
    () => buildAllWeeklySummaries(allSessions),
    [allSessions],
  );
  const pending = useMemo(
    () => (activeSession ? null : findPendingSession(sessions)),
    [sessions, activeSession],
  );

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  function syncWeek(all: WorkoutSessionT[], weekStart: string) {
    saveWeeklySummaries([buildWeeklySummary(all, weekStart)]).catch((err) =>
      console.error('Failed to save weekly summary', err),
    );
  }

  useEffect(() => {
    fetchAllSessions()
      .then((loaded) => {
        setSessions(loaded);
        // Persist every week that already has progress (idempotent upsert).
        saveWeeklySummaries(buildAllWeeklySummaries(loaded)).catch((err) =>
          console.error('Failed to save weekly summaries', err),
        );
      })
      .catch((err) => {
        console.error('Failed to load workout history', err);
        setHistoryError(
          'Não foi possível carregar o histórico do Supabase. Verifique sua conexão.',
        );
      });
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      saveSession(activeSession)
        .then(() =>
          syncWeek(
            upsertById(sessionsRef.current, activeSession),
            weekStartOf(activeSession.startedAt),
          ),
        )
        .catch((err) => console.error('Failed to sync workout session', err));
    }, 500);
    return () => window.clearTimeout(saveTimeout.current);
  }, [activeSession]);

  function handleStart(workoutId: string) {
    const session = createSession(workoutId);
    if (!session) return;
    setActiveSession(session);
    setView({ name: 'session' });
  }

  function handleResume() {
    if (!pending) return;
    setSessions((prev) => prev.filter((s) => s.id !== pending.id));
    setActiveSession(pending);
    setView({ name: 'session' });
  }

  function handleDiscardPending() {
    if (!pending) return;
    if (
      !window.confirm(
        `Descartar o treino ${pending.workoutId} em andamento? As séries marcadas serão apagadas.`,
      )
    ) {
      return;
    }
    deleteSession(pending.id).catch((err) =>
      console.error('Failed to discard workout session', err),
    );
    const rest = sessions.filter((s) => s.id !== pending.id);
    setSessions(rest);
    syncWeek(rest, weekStartOf(pending.startedAt));
  }

  async function handleFinish() {
    if (!activeSession) return;
    window.clearTimeout(saveTimeout.current);
    const finished = { ...activeSession, finishedAt: new Date().toISOString() };
    try {
      await saveSession(finished);
    } catch (err) {
      console.error('Failed to save finished workout session', err);
      window.alert(
        'Não foi possível salvar o treino no Supabase. Verifique sua conexão e tente novamente.',
      );
      return;
    }
    const next = upsertById(sessions, finished);
    setSessions(next);
    syncWeek(next, weekStartOf(finished.startedAt));
    setActiveSession(null);
    setView({ name: 'home' });
  }

  // "Sair" keeps the workout so it can be resumed from the home screen.
  // Only a workout with no completed set is thrown away.
  async function handleLeave() {
    if (!activeSession) return;
    window.clearTimeout(saveTimeout.current);
    if (!hasProgress(activeSession)) {
      deleteSession(activeSession.id).catch((err) =>
        console.error('Failed to discard empty workout session', err),
      );
    } else {
      try {
        await saveSession(activeSession);
      } catch (err) {
        console.error('Failed to save workout session', err);
        window.alert(
          'Não foi possível salvar o treino no Supabase. Verifique sua conexão e tente novamente.',
        );
        return;
      }
      const next = upsertById(sessions, activeSession);
      setSessions(next);
      syncWeek(next, weekStartOf(activeSession.startedAt));
    }
    setActiveSession(null);
    setView({ name: 'home' });
  }

  if (view.name === 'session' && activeSession) {
    const workout = getWorkout(activeSession.workoutId)!;
    return (
      <WorkoutSession
        workout={workout}
        session={activeSession}
        history={history}
        onChange={setActiveSession}
        onFinish={handleFinish}
        onCancel={handleLeave}
      />
    );
  }

  if (view.name === 'history') {
    return (
      <History
        history={history}
        weeks={weeks}
        onBack={() => setView({ name: 'home' })}
      />
    );
  }

  return (
    <Home
      history={history}
      historyError={historyError}
      pending={pending}
      onResume={handleResume}
      onDiscardPending={handleDiscardPending}
      onStart={handleStart}
      onOpenHistory={() => setView({ name: 'history' })}
    />
  );
}

export default App;
