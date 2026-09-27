export interface ExerciseDef {
  id: string;
  name: string;
  sets: number;
  repsRange: string;
  restSeconds: number;
  restLabel: string;
  muscles: string;
  tip: string;
  supersetWith?: string;
}

export interface CardioDef {
  totalMin: number;
  description: string;
}

export interface WorkoutDef {
  id: 'A' | 'B' | 'C';
  title: string;
  subtitle: string;
  warmupMin: number;
  exercises: ExerciseDef[];
  cardio: CardioDef;
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  workoutId: WorkoutDef['id'];
  startedAt: string;
  finishedAt: string | null;
  exercises: ExerciseLog[];
  cardioDone: boolean;
}
