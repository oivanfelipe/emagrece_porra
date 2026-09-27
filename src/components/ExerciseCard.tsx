import { Check, Lightbulb } from 'lucide-react';
import type { ExerciseDef, ExerciseLog } from '../types';

interface ExerciseCardProps {
  exercise: ExerciseDef;
  log: ExerciseLog;
  lastValues: { weight: number | null; reps: number | null } | null;
  onSetChange: (
    setIndex: number,
    field: 'weight' | 'reps',
    value: number | null,
  ) => void;
  onToggleSet: (setIndex: number) => void;
  supersetLabel?: string;
}

export function ExerciseCard({
  exercise,
  log,
  lastValues,
  onSetChange,
  onToggleSet,
  supersetLabel,
}: ExerciseCardProps) {
  const completedCount = log.sets.filter((s) => s.completed).length;
  const isDone = completedCount === exercise.sets;

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isDone
          ? 'border-emerald-800/60 bg-emerald-950/20'
          : 'border-neutral-800 bg-neutral-900/60'
      }`}
    >
      {supersetLabel && (
        <div className="mb-2 inline-block rounded-full bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-400">
          {supersetLabel}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">
            {exercise.name}
          </h3>
          <p className="text-xs text-neutral-400">
            {exercise.sets} x {exercise.repsRange} · descanso{' '}
            {exercise.restLabel}
          </p>
        </div>
        {isDone && (
          <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
            Concluído
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        <span className="font-semibold text-neutral-400">Músculos:</span>{' '}
        {exercise.muscles}
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-xs italic text-neutral-500">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2} />
        {exercise.tip}
      </p>

      {lastValues && (lastValues.weight != null || lastValues.reps != null) && (
        <p className="mt-2 text-xs text-neutral-500">
          Última vez:{' '}
          <span className="font-semibold text-neutral-300">
            {lastValues.weight != null ? `${lastValues.weight}kg` : '-'}
            {lastValues.reps != null ? ` x ${lastValues.reps}` : ''}
          </span>
        </p>
      )}

      <div className="mt-3 space-y-2">
        <div className="grid grid-cols-[28px_1fr_1fr_36px] gap-2 px-1 text-[11px] font-semibold uppercase text-neutral-500">
          <span>Set</span>
          <span>Kg</span>
          <span>Reps</span>
          <span></span>
        </div>
        {log.sets.map((set, i) => (
          <div
            key={i}
            className="grid grid-cols-[28px_1fr_1fr_36px] items-center gap-2"
          >
            <span className="text-sm font-bold text-neutral-400">{i + 1}</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder={lastValues?.weight != null ? String(lastValues.weight) : '0'}
              value={set.weight ?? ''}
              onChange={(e) =>
                onSetChange(
                  i,
                  'weight',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 text-center text-sm text-white outline-none focus:border-amber-600"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder={lastValues?.reps != null ? String(lastValues.reps) : '0'}
              value={set.reps ?? ''}
              onChange={(e) =>
                onSetChange(
                  i,
                  'reps',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-2 text-center text-sm text-white outline-none focus:border-amber-600"
            />
            <button
              onClick={() => onToggleSet(i)}
              aria-label={set.completed ? 'Desmarcar série' : 'Marcar série'}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-bold transition-colors ${
                set.completed
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-600'
              }`}
            >
              {set.completed && <Check className="h-4 w-4" strokeWidth={3} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
