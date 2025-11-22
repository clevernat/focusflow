export interface Subject {
  id: string;
  name: string;
  color: string;
  weeklyTargetMinutes: number; // Stored in minutes for easier calc
}

export interface Session {
  id: string;
  subjectId: string;
  date: string; // ISO Date string
  durationMinutes: number;
  topic: string;
  notes: string;
  rating: number; // 1-5
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export type ColorOption = {
  id: string;
  label: string;
  bgClass: string;
  textClass: string;
  hex: string;
};

export type Tab = 'study' | 'analytics' | 'calendar' | 'achievements' | 'reminders';

export type TimerMode = 'stopwatch' | 'timer';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  seconds: number; // Current value
  totalSeconds: number; // Original value (for countdown progress)
  subjectId: string;
  mode: TimerMode;
  isZenMode: boolean;
  audioEnabled: boolean;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setSubjectId: (id: string) => void;
  setMode: (mode: TimerMode) => void;
  setDuration: (seconds: number) => void;
  toggleZenMode: () => void;
  toggleAudio: () => void;
}