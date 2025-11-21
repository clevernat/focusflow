import React from 'react';
import { Trophy, Lock, Star, Target, Flame } from 'lucide-react';
import type { Achievement, UserAchievement } from '../lib/supabase';

interface AchievementsPanelProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

export default function AchievementsPanel({ achievements, userAchievements }: AchievementsPanelProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'target': return Target;
      case 'flame': return Flame;
      default: return Trophy;
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const ua = userAchievements.find(ua => ua.achievement_id === achievementId);
    return ua?.unlocked_at;
  };

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Achievements</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);
          const Icon = getIcon(achievement.icon);
          const unlockedDate = getUnlockedDate(achievement.id);

          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600'
                  : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 opacity-60'
              }`}
            >
              {/* Locked Overlay */}
              {!unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={16} className="text-gray-400 dark:text-slate-500" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    unlocked
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                >
                  <Icon size={24} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    {achievement.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded">
                      +{achievement.xp_reward} XP
                    </span>
                    {unlocked && unlockedDate && (
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        Unlocked {new Date(unlockedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-slate-400">No achievements available yet</p>
        </div>
      )}
    </div>
  );
}

