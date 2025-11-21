import React from 'react';
import { Flame, Trophy, Target } from 'lucide-react';
import type { StudyStreak } from '../lib/supabase';

interface StreakDisplayProps {
  streak: StudyStreak | null;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  if (!streak) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center py-8">
          <Flame size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400">Start studying to build your streak!</p>
        </div>
      </div>
    );
  }

  const { current_streak, longest_streak } = streak;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-sm border-2 border-orange-200 dark:border-orange-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg">
          <Flame className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Study Streak</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Keep the momentum going!</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame size={20} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Current</span>
          </div>
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            {current_streak}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">
            {current_streak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={20} className="text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Best</span>
          </div>
          <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
            {longest_streak}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">
            {longest_streak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
        <p className="text-sm text-center text-orange-800 dark:text-orange-300 font-medium">
          {current_streak === 0 && "Start today to begin your streak! 🚀"}
          {current_streak > 0 && current_streak < 7 && "Great start! Keep it up! 💪"}
          {current_streak >= 7 && current_streak < 30 && "You're on fire! 🔥"}
          {current_streak >= 30 && current_streak < 100 && "Incredible dedication! 🌟"}
          {current_streak >= 100 && "You're a study legend! 👑"}
        </p>
      </div>

      {/* Progress to next milestone */}
      {current_streak > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
              Next Milestone
            </span>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {current_streak < 7 ? '7 days' : current_streak < 30 ? '30 days' : current_streak < 100 ? '100 days' : '365 days'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  current_streak < 7
                    ? (current_streak / 7) * 100
                    : current_streak < 30
                    ? ((current_streak - 7) / 23) * 100
                    : current_streak < 100
                    ? ((current_streak - 30) / 70) * 100
                    : ((current_streak - 100) / 265) * 100
                }%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

