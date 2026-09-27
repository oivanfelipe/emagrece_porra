import { useEffect, useRef, useState } from 'react';
import { History } from './components/History';
import { Home } from './components/Home';
import { WorkoutSession } from './components/WorkoutSession';
import { getWorkout } from './data/workouts';
import {
  deleteSession,
  fetchFinishedHistory,
  saveSession,
} from './lib/workoutSessionsApi';
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

function App() {
  const [history, setHistory] = useState<WorkoutSessionT[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSessionT | null>(
    null,
  );
  const [view, setView] = useState<View>({ name: 'home' });
  const saveTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    fetchFinishedHistory()
      .then(setHistory)
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
      saveSession(activeSession).catch((err) =>
        console.error('Failed to sync workout session', err),
      );
    }, 500);
    return () => window.clearTimeout(saveTimeout.current);
  }, [activeSession]);

  function handleStart(workoutId: string) {
    const session = createSession(workoutId);
    if (!session) return;
    setActiveSession(session);
    setView({ name: 'session' });
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
    setHistory((prev) => [...prev, finished]);
    setActiveSession(null);
    setView({ name: 'home' });
  }

  function handleCancel() {
    if (
      activeSession &&
      !window.confirm('Sair sem salvar este treino? O progresso será perdido.')
    ) {
      return;
    }
    window.clearTimeout(saveTimeout.current);
    if (activeSession) {
      deleteSession(activeSession.id).catch((err) =>
        console.error('Failed to discard workout session', err),
      );
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
        onCancel={handleCancel}
      />
    );
  }

  if (view.name === 'history') {
    return <History history={history} onBack={() => setView({ name: 'home' })} />;
  }

  return (
    <Home
      history={history}
      historyError={historyError}
      onStart={handleStart}
      onOpenHistory={() => setView({ name: 'history' })}
    />
  );
}

export default App;
