import { Timer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RestTimerProps {
  seconds: number;
  label: string;
  onDismiss: () => void;
}

export function RestTimer({ seconds, label, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0 && !dismissedRef.current) {
      dismissedRef.current = true;
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  }, [remaining]);

  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <div className="fixed inset-x-0 bottom-[76px] z-50 border-t border-neutral-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="absolute h-16 w-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={remaining === 0 ? '#22c55e' : '#f59e0b'}
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-sm font-bold tabular-nums text-neutral-900">
            {mm}:{ss.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-neutral-500">
            <Timer className="h-3.5 w-3.5" strokeWidth={2.5} />
            Descanso
          </p>
          <p className="text-sm font-medium text-neutral-900">{label}</p>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 active:bg-neutral-200"
        >
          {remaining === 0 ? 'OK' : 'Pular'}
        </button>
      </div>
    </div>
  );
}
