import { AlertTriangle, Dumbbell, History as HistoryIcon } from 'lucide-react';
import { PLAN_META, WORKOUTS } from '../data/workouts';
import { formatDaysAgo, getLastSessionForWorkout, sessionsThisWeek } from '../lib/history';
import type { WorkoutSession } from '../types';

interface HomeProps {
  history: WorkoutSession[];
  historyError: string | null;
  onStart: (workoutId: string) => void;
  onOpenHistory: () => void;
}

export function Home({ history, historyError, onStart, onOpenHistory }: HomeProps) {
  const weekCount = sessionsThisWeek(history);

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-6">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-500">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={2.5} />
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

      {historyError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-xs text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          {historyError}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Esta semana</p>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 underline underline-offset-2"
          >
            <HistoryIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            ver histórico
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < weekCount ? 'bg-amber-500' : 'bg-neutral-800'
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
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left transition-colors active:border-amber-700 active:bg-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-neutral-950">
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
