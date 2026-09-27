import { PLAN_META, WORKOUTS } from '../data/workouts';
import { formatDaysAgo, getLastSessionForWorkout, sessionsThisWeek } from '../lib/history';
import type { WorkoutSession } from '../types';

interface HomeProps {
  history: WorkoutSession[];
  onStart: (workoutId: string) => void;
  onOpenHistory: () => void;
}

export function Home({ history, onStart, onOpenHistory }: HomeProps) {
  const weekCount = sessionsThisWeek(history);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-red-500">
          {PLAN_META.focus}
        </p>
        <h1 className="text-2xl font-black text-white">{PLAN_META.title}</h1>
        <p className="mt-1 text-sm text-neutral-400">{PLAN_META.goal}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-400">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <p className="font-bold text-white">{PLAN_META.frequency}</p>
            <p>frequência</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <p className="font-bold text-white">{PLAN_META.duration}</p>
            <p>duração</p>
          </div>
        </div>
      </header>

      <div className="mb-6 rounded-xl border border-red-900/40 bg-red-950/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Esta semana</p>
          <button
            onClick={onOpenHistory}
            className="text-xs font-semibold text-red-400 underline underline-offset-2"
          >
            ver histórico
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < weekCount ? 'bg-red-600' : 'bg-neutral-800'
              }`}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          {weekCount} de 3 treinos concluídos
        </p>
      </div>

      <div className="space-y-3">
        {WORKOUTS.map((w) => {
          const last = getLastSessionForWorkout(history, w.id);
          return (
            <button
              key={w.id}
              onClick={() => onStart(w.id)}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left transition-colors active:border-red-700 active:bg-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
                  {w.id}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {w.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {w.exercises.length} exercícios · {w.cardio.totalMin} min
                    cardio
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-neutral-500">
                    {last ? formatDaysAgo(last.finishedAt as string) : 'nunca feito'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
