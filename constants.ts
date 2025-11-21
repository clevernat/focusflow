import { ColorOption, Subject } from './types';

export const COLORS: ColorOption[] = [
  { id: 'blue', label: 'Blue', bgClass: 'bg-blue-500', textClass: 'text-blue-600 dark:text-blue-400', hex: '#3b82f6' },
  { id: 'purple', label: 'Purple', bgClass: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', hex: '#a855f7' },
  { id: 'pink', label: 'Pink', bgClass: 'bg-pink-500', textClass: 'text-pink-600 dark:text-pink-400', hex: '#ec4899' },
  { id: 'red', label: 'Red', bgClass: 'bg-red-500', textClass: 'text-red-600 dark:text-red-400', hex: '#ef4444' },
  { id: 'orange', label: 'Orange', bgClass: 'bg-orange-500', textClass: 'text-orange-600 dark:text-orange-400', hex: '#f97316' },
  { id: 'green', label: 'Green', bgClass: 'bg-green-500', textClass: 'text-green-600 dark:text-green-400', hex: '#22c55e' },
  { id: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-500', textClass: 'text-cyan-600 dark:text-cyan-400', hex: '#06b6d4' },
  { id: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', textClass: 'text-indigo-600 dark:text-indigo-400', hex: '#6366f1' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', color: 'blue', weeklyTargetMinutes: 300 },
  { id: '2', name: 'History', color: 'orange', weeklyTargetMinutes: 120 },
  { id: '3', name: 'Physics', color: 'purple', weeklyTargetMinutes: 240 },
];