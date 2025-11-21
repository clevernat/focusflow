import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  daily_goal: number;
  theme: string;
  notifications_enabled: boolean;
  total_xp: number;
  level: number;
  pomodoro_focus_minutes: number;
  pomodoro_short_break_minutes: number;
  pomodoro_long_break_minutes: number;
  created_at: string;
  updated_at: string;
};

export type DbSubject = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  weekly_goal: number;
  created_at: string;
  updated_at: string;
};

export type DbSession = {
  id: string;
  user_id: string;
  subject_id: string;
  date: string;
  duration_minutes: number;
  topic: string | null;
  notes: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type DbTask = {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
};

export type StudyStreak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  updated_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  time: string;
  days_of_week: number[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

