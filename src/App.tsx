import { useState } from 'react';
import { History } from './components/History';
import { Home } from './components/Home';
import { WorkoutSession } from './components/WorkoutSession';
import { getWorkout } from './data/workouts';
import { useLocalStorage } from './hooks/useLocalStorage';
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
  const [history, setHistory] = useLocalStorage<WorkoutSessionT[]>(
    'treino-superior-history-v1',
    [],
  );
  const [activeSession, setActiveSession] = useState<WorkoutSessionT | null>(
    null,
  );
  const [view, setView] = useState<View>({ name: 'home' });

  function handleStart(workoutId: string) {
    const session = createSession(workoutId);
    if (!session) return;
    setActiveSession(session);
    setView({ name: 'session' });
  }

  function handleFinish() {
    if (!activeSession) return;
    const finished = { ...activeSession, finishedAt: new Date().toISOString() };
    setHistory([...history, finished]);
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
      onStart={handleStart}
      onOpenHistory={() => setView({ name: 'history' })}
    />
  );
}

export default App;
