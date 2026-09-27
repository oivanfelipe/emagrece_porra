import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { WORKOUTS, getWorkout } from '../data/workouts';
import { exerciseHistory } from '../lib/history';
import type { WorkoutSession } from '../types';

interface HistoryProps {
  history: WorkoutSession[];
  onBack: () => void;
}

const ALL_EXERCISES = WORKOUTS.flatMap((w) => w.exercises).reduce(
  (acc, e) => {
    if (!acc.find((x) => x.id === e.id)) acc.push(e);
    return acc;
  },
  [] as { id: string; name: string }[],
);

export function History({ history, onBack }: HistoryProps) {
  const [exerciseId, setExerciseId] = useState(ALL_EXERCISES[0]?.id ?? '');
  const finished = [...history]
    .filter((s) => s.finishedAt)
    .reverse();

  const progress = exerciseHistory(history, exerciseId);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="Voltar" className="text-neutral-400">
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-black text-white">Histórico</h1>
      </div>

      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-white">
          <TrendingUp className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
          Progressão por exercício
        </p>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-600"
        >
          {ALL_EXERCISES.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        {progress.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Ainda sem registros para este exercício.
          </p>
        ) : (
          <div className="space-y-1.5">
            {progress.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-neutral-800/60 px-3 py-2 text-xs"
              >
                <span className="text-neutral-400">
                  {new Date(row.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="font-semibold text-white">
                  {row.weight != null ? `${row.weight}kg` : '-'}
                  {row.reps != null ? ` x ${row.reps}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-sm font-bold text-white">Treinos concluídos</p>
        {finished.length === 0 && (
          <p className="text-xs text-neutral-500">Nenhum treino concluído ainda.</p>
        )}
        <div className="space-y-2">
          {finished.map((s) => {
            const workout = getWorkout(s.workoutId);
            const durationMin = s.finishedAt
              ? Math.round(
                  (new Date(s.finishedAt).getTime() -
                    new Date(s.startedAt).getTime()) /
                    60000,
                )
              : null;
            const totalSets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
            const doneSets = s.exercises.reduce(
              (a, e) => a + e.sets.filter((x) => x.completed).length,
              0,
            );
            return (
              <div
                key={s.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    Treino {s.workoutId} — {workout?.title}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(s.finishedAt as string).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {doneSets}/{totalSets} séries
                  {durationMin != null ? ` · ${durationMin} min` : ''}
                  {s.cardioDone ? ' · cardio ok' : ''}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
