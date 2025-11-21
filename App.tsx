import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, PieChart, Layers, Clock, Sun, Moon, Settings, Download, Upload, X, FileJson, AlertTriangle, Bell, LogOut, User as UserIcon, Trophy, BellRing } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import AchievementsPanel from './components/AchievementsPanel';
import RemindersPanel from './components/RemindersPanel';
import { AlertModal, ConfirmModal } from './components/Modal';
import { Subject, Session, Tab, TimerState, TimerActions, Task, TimerMode } from './types';
import { format } from 'date-fns';
import { useAuth } from './contexts/AuthContext';
import { useSupabaseData } from './hooks/useSupabaseData';
import { supabase } from './lib/supabase';
import { useGamification } from './hooks/useGamification';
import AchievementNotification from './components/AchievementNotification';
import type { Achievement } from './lib/supabase';
import { useReminderChecker } from './hooks/useReminderChecker';
import { useModal } from './hooks/useModal';

const App: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const {
    subjects,
    sessions,
    tasks,
    loading: dataLoading,
    addSubject,
    updateSubject,
    deleteSubject,
    addSession,
    updateSession,
    deleteSession,
    addTask,
    toggleTask,
    deleteTask,
  } = useSupabaseData();

  const {
    achievements,
    userAchievements,
    streak,
    loading: gamificationLoading,
    checkAndUnlockAchievements
  } = useGamification(user?.id);

  // Background reminder checker - runs on all pages
  useReminderChecker(user?.id);

  // Modal management
  const {
    alertState,
    showAlert,
    closeAlert,
    confirmState,
    showConfirm,
    closeConfirm
  } = useModal();

  const [activeTab, setActiveTab] = useState<Tab>('study');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (profile?.theme) return profile.theme as 'light' | 'dark';
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('focusflow_theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('focusflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Daily Goal State (Minutes) ---
  const dailyGoal = profile?.daily_goal || 240;

  // Debug: Log when dailyGoal changes
  useEffect(() => {
    console.log('📊 Daily Goal changed:', dailyGoal, 'minutes (', (dailyGoal / 60).toFixed(1), 'hours)');
    console.log('📊 Profile data:', profile);
  }, [dailyGoal, profile]);

  // --- Global Timer State ---
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0); // Used for countdown progress
  const [timerSubjectId, setTimerSubjectId] = useState<string>('');
  const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch');
  const [isZenMode, setIsZenMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // --- Audio Engine ---
  const playTone = useCallback((type: 'start' | 'complete' | 'alarm' | 'tick') => {
    if (!audioEnabled) return;
    
    // Simple Web Audio API synthesizer
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'start') {
        // Rising cheerful tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'complete') {
        // Success chord
        const frequencies = [523.25, 659.25, 783.99]; // C Major
        frequencies.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = f;
          g.gain.setValueAtTime(0.1, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
          o.start(now + (i * 0.05));
          o.stop(now + 1.0 + (i * 0.05));
        });
      } else if (type === 'alarm') {
        // Repeating alarm
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        
        // Beep-beep-beep
        for(let i=0; i<3; i++) {
           const start = now + i * 0.5;
           gain.gain.setValueAtTime(0.1, start);
           gain.gain.setValueAtTime(0.001, start + 0.1);
        }
        osc.start(now);
        osc.stop(now + 1.5);
      }
    } catch (e) {
      console.error("Audio play error", e);
    }
  }, [audioEnabled]);

  // Request notification permission on first user interaction
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // We don't force it immediately, but we check status
    }
  }, []);

  const sendNotification = async (title: string, body: string) => {
    console.log('🔔 sendNotification called with:', { title, body });
    console.log('🌐 Window has Notification API:', 'Notification' in window);

    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      showAlert('Notifications are not supported in this browser.', 'Not Supported', 'error');
      return;
    }

    console.log('📢 Current permission:', Notification.permission);

    try {
      if (Notification.permission === 'granted') {
        console.log('✅ Permission already granted, creating notification...');
        const notification = new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          requireInteraction: true, // Changed to true - notification stays until clicked
          silent: false, // Make sure it makes a sound
          tag: 'focusflow-test' // Unique tag
        });

        // Add event listeners to see if notification is working
        notification.onclick = () => {
          console.log('✅ Notification was clicked!');
          showAlert('You clicked the notification!', 'Notification Clicked', 'success');
          notification.close();
        };

        notification.onshow = () => {
          console.log('✅ Notification is showing!');
        };

        notification.onerror = (error) => {
          console.error('❌ Notification error:', error);
        };

        console.log('✅ Notification created:', notification);
        showAlert('Notification sent! It should appear on your screen now.\n\nIf you don\'t see it:\n1. Check your system notification settings\n2. Turn off Do Not Disturb mode\n3. Check your notification center/tray', 'Notification Sent', 'success');
      } else if (Notification.permission === 'denied') {
        console.error('❌ Permission denied');
        showAlert('Notifications are blocked. Please enable them in your browser settings:\n\n1. Click the lock icon (🔒) in the address bar\n2. Find "Notifications"\n3. Change to "Allow"\n4. Refresh the page', 'Permission Denied', 'error');
      } else {
        console.log('⚠️ Permission not set, requesting...');
        // Request permission
        const permission = await Notification.requestPermission();
        console.log('📢 Permission result:', permission);

        if (permission === 'granted') {
          console.log('✅ Permission granted! Creating notification...');
          const notification = new Notification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            requireInteraction: true,
            silent: false,
            tag: 'focusflow-test'
          });

          notification.onclick = () => {
            console.log('✅ Notification was clicked!');
            showAlert('You clicked the notification!', 'Notification Clicked', 'success');
            notification.close();
          };

          notification.onshow = () => {
            console.log('✅ Notification is showing!');
          };

          notification.onerror = (error) => {
            console.error('❌ Notification error:', error);
          };

          console.log('✅ Notification created:', notification);
          showAlert('Permission granted! Notification sent!\n\nIt should appear on your screen now.\n\nIf you don\'t see it, check:\n1. System notification settings\n2. Do Not Disturb mode\n3. Notification center/tray', 'Success', 'success');
        } else if (permission === 'denied') {
          console.error('❌ User denied permission');
          showAlert('You denied notification permission. You can enable it later in browser settings.', 'Permission Denied', 'error');
        } else {
          console.warn('⚠️ Permission result was:', permission);
          showAlert('Notification permission was not granted. Status: ' + permission, 'Permission Not Granted', 'warning');
        }
      }
    } catch (error) {
      console.error('❌ Notification error:', error);
      showAlert('Failed to send notification. Error: ' + (error as Error).message + '\n\nPlease check your browser settings and console for details.', 'Notification Error', 'error');
    }
  };

  // Timer Interval Logic
  useEffect(() => {
    let interval: number | null = null;
    
    if (timerActive && !timerPaused) {
      interval = window.setInterval(() => {
        setTimerSeconds((currentSeconds) => {
          if (timerMode === 'stopwatch') {
            return currentSeconds + 1;
          } else {
            // Countdown logic
            if (currentSeconds <= 1) {
              // Timer Finished
              playTone('alarm');
              setTimerActive(false);
              setTimerPaused(false);
              
              // Browser Notification
              sendNotification("FocusFlow", "Time is up! Great work.");
              
              return 0;
            }
            return currentSeconds - 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerPaused, timerMode, playTone]);

  // Timer Actions
  const timerActions: TimerActions = {
    start: () => {
      playTone('start');
      setTimerActive(true);
      setTimerPaused(false);
    },
    pause: () => {
      setTimerPaused((prev) => !prev);
    },
    stop: () => {
      setTimerActive(false);
      setTimerPaused(false);
      if (timerMode === 'timer') {
        // When stopping a countdown prematurely, we usually want to complete or reset
        // Here we just pause effectively, but the UI treats "Complete" as stop
      }
    },
    reset: () => {
      setTimerActive(false);
      setTimerPaused(false);
      if (timerMode === 'stopwatch') {
        setTimerSeconds(0);
      } else {
        setTimerSeconds(timerTotalSeconds); // Reset to original duration
      }
      // Do NOT reset subject ID, user might want to go again
    },
    setSubjectId: setTimerSubjectId,
    setMode: (mode: TimerMode) => {
      setTimerMode(mode);
      setTimerActive(false);
      setTimerPaused(false);
      if (mode === 'stopwatch') {
        setTimerSeconds(0);
        setTimerTotalSeconds(0);
      } else {
        setTimerSeconds(25 * 60); // Default 25m
        setTimerTotalSeconds(25 * 60);
      }
    },
    setDuration: (seconds: number) => {
      setTimerSeconds(seconds);
      setTimerTotalSeconds(seconds);
    },
    toggleZenMode: () => setIsZenMode(prev => !prev),
    toggleAudio: () => setAudioEnabled(prev => !prev)
  };

  const timerState: TimerState = {
    isActive: timerActive,
    isPaused: timerPaused,
    seconds: timerSeconds,
    totalSeconds: timerTotalSeconds,
    subjectId: timerSubjectId,
    mode: timerMode,
    isZenMode,
    audioEnabled
  };

  const formatNavTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Data is now persisted to Supabase automatically via hooks

  const handleUpdateDailyGoal = async (newGoal: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_goal: newGoal, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile to get updated daily goal
      await refreshProfile();

      showAlert(`Daily goal updated to ${(newGoal / 60).toFixed(1)} hours!`, 'Success', 'success');
    } catch (error) {
      console.error('Error updating daily goal:', error);
      showAlert('Failed to update daily goal. Please try again.', 'Error', 'error');
    }
  };

  const handleSaveSession = async (sessionData: Omit<Session, 'id'>) => {
    playTone('complete');
    try {
      await addSession(sessionData);

      // Check for achievements after saving session
      const totalSessions = sessions.length + 1;
      const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0) + sessionData.durationMinutes;
      const currentStreak = streak?.current_streak || 0;

      const newAchievements = await checkAndUnlockAchievements(totalSessions, totalMinutes, currentStreak);
      if (newAchievements.length > 0) {
        setAchievementNotifications(prev => [...prev, ...newAchievements]);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      showAlert('Failed to save session. Please try again.', 'Error', 'error');
    }
  };

  const handleUpdateSession = async (id: string, updatedData: Partial<Session>) => {
    try {
      await updateSession(id, updatedData);
    } catch (error) {
      console.error('Error updating session:', error);
      showAlert('Failed to update session. Please try again.', 'Error', 'error');
    }
  };

  const handleDeleteSession = async (id: string) => {
    showConfirm(
      'Are you sure you want to delete this session record?',
      async () => {
        try {
          await deleteSession(id);
        } catch (error) {
          console.error('Error deleting session:', error);
          showAlert('Failed to delete session. Please try again.', 'Error', 'error');
        }
      },
      'Delete Session',
      'warning',
      'Delete',
      'Cancel'
    );
  };

  const handleAddSubject = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      await addSubject(subjectData);
    } catch (error) {
      console.error('Error adding subject:', error);
      showAlert('Failed to add subject. Please try again.', 'Error', 'error');
    }
  };

  const handleUpdateSubject = async (id: string, updatedData: Omit<Subject, 'id'>) => {
    try {
      await updateSubject(id, updatedData);
    } catch (error) {
      console.error('Error updating subject:', error);
      showAlert('Failed to update subject. Please try again.', 'Error', 'error');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    const subjectToDelete = subjects.find(s => s.id === id);
    const subjectName = subjectToDelete?.name || 'this subject';

    // Check if used
    const hasHistory = sessions.some(s => s.subjectId === id);

    const message = hasHistory
      ? `Warning: You have study sessions recorded for "${subjectName}".\n\nDeleting it will keep your session history, but they will show as "Unknown Subject".\n\nDo you want to proceed?`
      : `Are you sure you want to delete "${subjectName}"?`;

    showConfirm(
      message,
      async () => {
        try {
          await deleteSubject(id);

          // If the timer was running on this subject, reset it safely
          if (timerState.subjectId === id) {
            timerActions.reset();
          }
        } catch (error) {
          console.error('Error deleting subject:', error);
          showAlert('Failed to delete subject. Please try again.', 'Error', 'error');
        }
      },
      'Delete Subject',
      'warning',
      'Delete',
      'Cancel'
    );
  };

  // Task Handlers
  const handleAddTask = async (text: string) => {
    try {
      await addTask(text);
    } catch (error) {
      console.error('Error adding task:', error);
      showAlert('Failed to add task. Please try again.', 'Error', 'error');
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (error) {
      console.error('Error toggling task:', error);
      showAlert('Failed to update task. Please try again.', 'Error', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      showAlert('Failed to delete task. Please try again.', 'Error', 'error');
    }
  };

  // --- Data Management ---
  const handleExportData = () => {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      subjects,
      sessions,
      tasks,
      dailyGoal
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Basic validation
        if (!Array.isArray(data.subjects) || !Array.isArray(data.sessions)) {
            showAlert('Invalid backup file format. Missing required data fields.', 'Invalid File', 'error');
            return;
        }

        showConfirm(
          'Warning: Importing this file will OVERWRITE your current data. This action cannot be undone.\n\nAre you sure you want to proceed?',
          () => {
            setSubjects(data.subjects);
            setSessions(data.sessions);
            setTasks(data.tasks || []);
            if (data.dailyGoal) setDailyGoal(data.dailyGoal);
            setIsSettingsModalOpen(false);
            showAlert('Data imported successfully!', 'Import Complete', 'success');
          },
          'Import Data',
          'warning',
          'Import',
          'Cancel'
        );
      } catch (err) {
        showAlert('Failed to parse backup file. Please ensure it is a valid JSON file from FocusFlow.', 'Import Error', 'error');
        console.error(err);
      }
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300 ${isZenMode ? 'overflow-hidden' : ''}`}>
      {/* Top Navigation Bar (Hidden in Zen Mode) */}
      <nav className={`sticky top-0 z-40 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-500 ${isZenMode ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent hidden sm:block">
                FocusFlow
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer Badge */}
              {timerActive && !timerPaused && activeTab !== 'study' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full mr-2 animate-pulse">
                  <Clock size={14} />
                  <span className="text-xs font-mono font-semibold">{formatNavTimer(timerSeconds)}</span>
                </div>
              )}

              <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setActiveTab('study')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'study' 
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Study</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <PieChart size={18} />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'achievements'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Trophy size={18} />
                  <span className="hidden sm:inline">Achievements</span>
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    activeTab === 'reminders'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <BellRing size={18} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Reminders are active"></span>
                  </div>
                  <span className="hidden sm:inline">Reminders</span>
                </button>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Settings & Data"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Level {profile?.level || 1} • {profile?.total_xp || 0} XP
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`transition-all duration-500 ${isZenMode ? 'h-screen flex items-center justify-center p-0 bg-slate-50 dark:bg-slate-900' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {activeTab === 'study' ? (
          <div className={`w-full ${isZenMode ? 'max-w-2xl px-4' : 'animate-in fade-in slide-in-from-bottom-2 duration-500'}`}>
             <Dashboard 
               subjects={subjects} 
               sessions={sessions}
               tasks={tasks}
               timerState={timerState}
               timerActions={timerActions}
               dailyGoal={dailyGoal}
               onUpdateDailyGoal={handleUpdateDailyGoal}
               onSaveSession={handleSaveSession}
               onUpdateSession={handleUpdateSession}
               onDeleteSession={handleDeleteSession}
               onAddSubject={handleAddSubject}
               onUpdateSubject={handleUpdateSubject}
               onDeleteSubject={handleDeleteSubject}
               onAddTask={handleAddTask}
               onToggleTask={handleToggleTask}
               onDeleteTask={handleDeleteTask}
             />
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Analytics sessions={sessions} subjects={subjects} isDarkMode={theme === 'dark'} streak={streak} />
          </div>
        ) : activeTab === 'achievements' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AchievementsPanel achievements={achievements} userAchievements={userAchievements} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {user && <RemindersPanel userId={user.id} />}
          </div>
        )}
      </main>

      {/* Achievement Notifications */}
      {achievementNotifications.map((achievement, index) => (
        <AchievementNotification
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => {
            setAchievementNotifications(prev => prev.filter((_, i) => i !== index));
          }}
        />
      ))}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-colors max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Settings size={20} />
                Settings & Data
              </h3>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Notifications Section */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 dark:text-white text-sm flex items-center gap-2">
                  <Bell size={16} />
                  Notifications
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Get notified when your timer finishes, even if you are on another tab.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendNotification("FocusFlow Test", "Notifications are working correctly! 🎉")}
                    className="text-xs px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800"
                  >
                    Test / Request Permission
                  </button>
                  {typeof window !== 'undefined' && 'Notification' in window && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      Notification.permission === 'granted'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : Notification.permission === 'denied'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {Notification.permission === 'granted' ? '✓ Enabled' : Notification.permission === 'denied' ? '✗ Blocked' : '? Not Set'}
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-slate-700" />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                   <FileJson className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                   <div>
                     <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Data Management</h4>
                     <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                       FocusFlow stores your data securely in the cloud with Supabase. Your data syncs automatically across all your devices.
                     </p>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                      <Download size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">Download JSON backup</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={triggerFileInput}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Import Data</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">Restore from JSON file</div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportData}
                    accept=".json" 
                    className="hidden" 
                  />
                </button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-500">
                  <strong>Note:</strong> Importing data will completely replace your current subjects, sessions, and tasks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm || (() => {})}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </div>
  );
};

export default App;