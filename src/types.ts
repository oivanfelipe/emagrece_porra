export interface ExerciseDef {
  id: string;
  name: string;
  sets: number;
  repsRange: string;
  restSeconds: number;
  restLabel: string;
  muscles: string;
  tip: string;
  image: string;
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

export interface WeeklySummary {
  weekStart: string; // YYYY-MM-DD (Monday, local time)
  workoutsCount: number;
  workoutIds: string[];
  totalSets: number;
  completedSets: number;
  volumeKg: number;
  cardioCount: number;
}
