import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ExerciseImageModalProps {
  name: string;
  image: string;
  onClose: () => void;
}

export function ExerciseImageModal({ name, image, onClose }: ExerciseImageModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">{name}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 active:bg-neutral-100"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        <img
          src={image}
          alt={`Execução do exercício ${name}`}
          className="w-full rounded-xl border border-neutral-200 object-contain"
        />
      </div>
    </div>
  );
}
