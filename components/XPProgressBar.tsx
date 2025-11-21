import React from 'react';
import { Star } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
}

export default function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded">
            <Star size={14} className="text-white fill-white" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            Level {level}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
          {xpInCurrentLevel} / {xpNeededForLevel} XP
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

