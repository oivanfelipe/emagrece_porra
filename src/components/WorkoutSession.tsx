import { ArrowLeft, Bike, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { getLastSetLog } from '../lib/history';
import type { WorkoutDef, WorkoutSession as WorkoutSessionT } from '../types';

interface WorkoutSessionProps {
  workout: WorkoutDef;
  session: WorkoutSessionT;
  history: WorkoutSessionT[];
  onChange: (session: WorkoutSessionT) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export function WorkoutSession({
  workout,
  session,
  history,
  onChange,
  onFinish,
  onCancel,
}: WorkoutSessionProps) {
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState<{
    seconds: number;
    label: string;
    key: number;
  } | null>(null);
  const restTimerCounter = useRef(0);

  useEffect(() => {
    const start = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session.startedAt]);

  const totalSets = useMemo(
    () => workout.exercises.reduce((acc, e) => acc + e.sets, 0),
    [workout],
  );
  const doneSets = useMemo(
    () =>
      session.exercises.reduce(
        (acc, e) => acc + e.sets.filter((s) => s.completed).length,
        0,
      ),
    [session],
  );

  function updateSet(
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number | null,
  ) {
    onChange({
      ...session,
      exercises: session.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: value } : s,
              ),
            }
          : e,
      ),
    });
  }

  function toggleSet(exerciseId: string, setIndex: number) {
    const exercise = workout.exercises.find((e) => e.id === exerciseId);
    let willComplete = false;
    onChange({
      ...session,
      exercises: session.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) => {
                if (i !== setIndex) return s;
                willComplete = !s.completed;
                return { ...s, completed: !s.completed };
              }),
            }
          : e,
      ),
    });
    if (willComplete && exercise) {
      restTimerCounter.current += 1;
      setRestTimer({
        seconds: exercise.restSeconds,
        label: `${exercise.name} · próxima série`,
        key: restTimerCounter.current,
      });
    }
  }

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-sm font-semibold text-neutral-500"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          sair
        </button>
        <span className="text-sm font-bold tabular-nums text-neutral-600">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-black text-neutral-950">
            {workout.id}
          </div>
          <h1 className="text-xl font-black text-neutral-900">{workout.title}</h1>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Aquecimento: {workout.warmupMin} min (bicicleta leve + mobilidade)
        </p>
      </div>

      <div className="mb-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${(doneSets / totalSets) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          {doneSets} de {totalSets} séries
        </p>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex) => {
          const log = session.exercises.find((e) => e.exerciseId === ex.id)!;
          const lastValues = getLastSetLog(history, ex.id);
          const supersetLabel = ex.supersetWith
            ? `Superset com ${
                workout.exercises.find((o) => o.id === ex.supersetWith)?.name
              }`
            : undefined;
          return (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              log={log}
              lastValues={lastValues}
              supersetLabel={supersetLabel}
              onSetChange={(i, field, value) =>
                updateSet(ex.id, i, field, value)
              }
              onToggleSet={(i) => toggleSet(ex.id, i)}
            />
          );
        })}

        <div
          className={`rounded-2xl border p-4 ${
            session.cardioDone
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Bike className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" strokeWidth={2} />
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  Cardio — Bicicleta
                </h3>
                <p className="text-xs text-neutral-500">
                  {workout.cardio.totalMin} min · {workout.cardio.description}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                onChange({ ...session, cardioDone: !session.cardioDone })
              }
              aria-label={session.cardioDone ? 'Desmarcar cardio' : 'Marcar cardio'}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                session.cardioDone
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-neutral-300 bg-neutral-100 text-neutral-400'
              }`}
            >
              {session.cardioDone && <Check className="h-4 w-4" strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            onClick={onFinish}
            className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-neutral-950 active:bg-amber-600"
          >
            Finalizar treino
          </button>
        </div>
      </div>

      {restTimer && (
        <RestTimer
          key={restTimer.key}
          seconds={restTimer.seconds}
          label={restTimer.label}
          onDismiss={() => setRestTimer(null)}
        />
      )}
    </div>
  );
}
