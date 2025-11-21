import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Achievement, UserAchievement, StudyStreak } from '../lib/supabase';

interface GamificationData {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  streak: StudyStreak | null;
  loading: boolean;
}

export function useGamification(userId: string | undefined) {
  const [data, setData] = useState<GamificationData>({
    achievements: [],
    userAchievements: [],
    streak: null,
    loading: true
  });

  useEffect(() => {
    if (!userId) {
      setData({ achievements: [], userAchievements: [], streak: null, loading: false });
      return;
    }

    fetchGamificationData();

    // Subscribe to user achievements changes
    const channel = supabase
      .channel('gamification_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchGamificationData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_streaks',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchGamificationData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchGamificationData = async () => {
    if (!userId) return;

    try {
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user's unlocked achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (userAchievementsError) throw userAchievementsError;

      // Fetch streak data
      const { data: streakData, error: streakError } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      setData({
        achievements: achievementsData || [],
        userAchievements: userAchievementsData || [],
        streak: streakData || null,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const checkAndUnlockAchievements = async (
    totalSessions: number,
    totalMinutes: number,
    currentStreak: number
  ) => {
    if (!userId) return [];

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of data.achievements) {
      // Check if already unlocked
      const alreadyUnlocked = data.userAchievements.some(
        ua => ua.achievement_id === achievement.id
      );
      if (alreadyUnlocked) continue;

      // Check if requirements are met
      let shouldUnlock = false;
      switch (achievement.requirement_type) {
        case 'sessions':
          shouldUnlock = totalSessions >= achievement.requirement_value;
          break;
        case 'minutes':
          shouldUnlock = totalMinutes >= achievement.requirement_value;
          break;
        case 'streak':
          shouldUnlock = currentStreak >= achievement.requirement_value;
          break;
      }

      if (shouldUnlock) {
        try {
          // Unlock achievement
          const { error: unlockError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id
            });

          if (unlockError) throw unlockError;

          // Award XP
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('total_xp, level')
            .eq('id', userId)
            .single();

          if (profileError) throw profileError;

          const newXP = (profile.total_xp || 0) + achievement.xp_reward;
          const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              total_xp: newXP,
              level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) throw updateError;

          newlyUnlocked.push(achievement);
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      }
    }

    return newlyUnlocked;
  };

  return {
    ...data,
    checkAndUnlockAchievements,
    refreshData: fetchGamificationData
  };
}

