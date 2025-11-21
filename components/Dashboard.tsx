import React, { useMemo, useState, useEffect } from 'react';
import { Subject, Session, ColorOption, TimerState, TimerActions, Task } from '../types';
import { Timer } from './Timer';
import { Heatmap } from './Heatmap';
import { COLORS } from '../constants';
import { Plus, Clock, BarChart3, Trophy, Star, Trash2, Pencil, X, CheckCircle2, Circle, ListTodo, Flame, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, isSameDay, subDays, parseISO } from 'date-fns';
import { InputModal } from './InputModal';

interface DashboardProps {
  subjects: Subject[];
  sessions: Session[];
  tasks: Task[];
  timerState: TimerState;
  timerActions: TimerActions;
  dailyGoal: number;
  onUpdateDailyGoal: (minutes: number) => void;
  onSaveSession: (data: Omit<Session, 'id'>) => void;
  onUpdateSession: (id: string, data: Partial<Session>) => void;
  onDeleteSession: (id: string) => void;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (id: string, subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  pomodoroSettings?: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  subjects,
  sessions,
  tasks,
  timerState,
  timerActions,
  dailyGoal,
  onUpdateDailyGoal,
  onSaveSession,
  onUpdateSession,
  onDeleteSession,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  pomodoroSettings
}) => {
  // Debug: Log dailyGoal prop changes
  useEffect(() => {
    console.log('📊 Dashboard received dailyGoal prop:', dailyGoal, 'minutes (', (dailyGoal / 60).toFixed(1), 'hours)');
  }, [dailyGoal]);

  // --- Modal States ---
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // --- Subject Form State ---
  const [subName, setSubName] = useState('');
  const [subColor, setSubColor] = useState('blue');
  const [subTarget, setSubTarget] = useState(120);

  // --- Session Form State ---
  const [sessTopic, setSessTopic] = useState('');
  const [sessNotes, setSessNotes] = useState('');
  const [sessRating, setSessRating] = useState(3);
  
  // --- Task Form State ---
  const [newTaskText, setNewTaskText] = useState('');

  // --- Metrics Calculations ---
  const today = new Date();
  
  const todaySessions = useMemo(() => 
    sessions.filter(s => isSameDay(new Date(s.date), today)), 
  [sessions]);

  const todayMinutes = useMemo(() => 
    todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0), 
  [todaySessions]);

  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const thisWeekSessions = useMemo(() => 
    sessions.filter(s => isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd })), 
  [sessions]);

  const thisWeekMinutes = useMemo(() => 
    thisWeekSessions.reduce((acc, s) => acc + s.durationMinutes, 0), 
  [thisWeekSessions]);

  const totalMinutes = useMemo(() => 
    sessions.reduce((acc, s) => acc + s.durationMinutes, 0), 
  [sessions]);

  const avgRating = useMemo(() => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.rating, 0);
    return (sum / sessions.length).toFixed(1);
  }, [sessions]);

  // --- Streak Calculation ---
  const streakCount = useMemo(() => {
    if (sessions.length === 0) return 0;
    
    // Get unique sorted dates (descending)
    const uniqueDates = Array.from(new Set(
      sessions.map(s => format(new Date(s.date), 'yyyy-MM-dd'))
    )).sort().reverse();
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    let currentStreak = 0;
    
    // Check if we have studied today
    const hasStudiedToday = uniqueDates.includes(todayStr);
    
    // If we haven't studied today AND haven't studied yesterday, streak is broken/0
    if (!hasStudiedToday && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }
    
    // Start counting backwards
    // If today is present, start from today (index 0)
    // If today is missing but yesterday is present, start from yesterday (index 0 in filtered list effectively, but logic below handles direct dates)
    
    let checkDate = hasStudiedToday ? new Date() : subDays(new Date(), 1);
    
    while (true) {
      const checkStr = format(checkDate, 'yyyy-MM-dd');
      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [sessions]);

  const getSubjectProgress = (subjectId: string) => {
    const subSessions = thisWeekSessions.filter(s => s.subjectId === subjectId);
    const currentMins = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    return currentMins;
  };

  // --- Handlers ---

  const openAddSubjectModal = () => {
    setEditingSubjectId(null);
    setSubName('');
    setSubColor('blue');
    setSubTarget(120);
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setSubName(sub.name);
    setSubColor(sub.color);
    setSubTarget(sub.weeklyTargetMinutes || 120);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const data = {
      name: subName,
      color: subColor,
      weeklyTargetMinutes: Number(subTarget)
    };

    if (editingSubjectId) {
      onUpdateSubject(editingSubjectId, data);
    } else {
      onAddSubject(data);
    }
    setIsSubjectModalOpen(false);
  };

  const openEditSessionModal = (session: Session) => {
    setEditingSessionId(session.id);
    setSessTopic(session.topic);
    setSessNotes(session.notes);
    setSessRating(session.rating);
    setIsSessionModalOpen(true);
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionId) return;

    onUpdateSession(editingSessionId, {
      topic: sessTopic,
      notes: sessNotes,
      rating: sessRating
    });
    setIsSessionModalOpen(false);
  };
  
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const handleEditDailyGoal = () => {
    setIsDailyGoalModalOpen(true);
  };

  const handleDailyGoalSubmit = (value: string) => {
    const minutes = parseFloat(value) * 60;
    if (!isNaN(minutes) && minutes > 0) {
      onUpdateDailyGoal(Math.round(minutes));
    }
  };

  // Calculate progress for Daily Goal Ring
  const goalPercentage = Math.min(100, (todayMinutes / dailyGoal) * 100);
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (goalPercentage / 100) * ringCircumference;

  // If Zen Mode is active, we only render the Timer in a centered container
  if (timerState.isZenMode) {
    return (
       <div className="flex items-center justify-center w-full h-full">
          <div className="w-full max-w-3xl">
            <Timer
              subjects={subjects}
              timerState={timerState}
              timerActions={timerActions}
              onSaveSession={onSaveSession}
              pomodoroSettings={pomodoroSettings}
            />
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
             Welcome back!
           </h1>
           <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
             Ready to stay focused today?
           </p>
        </div>
        {streakCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-full shadow-sm animate-in fade-in slide-in-from-right-5 duration-700">
             <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-500">
               <Flame size={18} fill="currentColor" className="animate-pulse" />
             </div>
             <div>
               <p className="text-xs text-gray-500 dark:text-orange-200 font-semibold uppercase tracking-wider leading-none">Current Streak</p>
               <p className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-none">{streakCount} <span className="text-sm font-normal">{streakCount === 1 ? 'Day' : 'Days'}</span></p>
             </div>
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today / Daily Goal Card */}
        <div 
          onClick={handleEditDailyGoal}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors relative overflow-hidden cursor-pointer group"
        >
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Clock size={16} />
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Today's Goal</span>
              </div>
              <div className="mt-2">
                 <div className="text-2xl font-bold text-gray-800 dark:text-white">
                   {(todayMinutes / 60).toFixed(1)}<span className="text-base text-gray-400 dark:text-slate-500">/{(dailyGoal / 60).toFixed(0)}h</span>
                 </div>
                 <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 group-hover:text-blue-500 transition-colors">Tap to edit goal</p>
              </div>
            </div>
            
            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                 <circle
                   cx="32" cy="32" r={ringRadius}
                   stroke="currentColor"
                   strokeWidth="6"
                   fill="transparent"
                   className="text-gray-100 dark:text-slate-700"
                 />
                 <circle
                   cx="32" cy="32" r={ringRadius}
                   stroke="currentColor"
                   strokeWidth="6"
                   fill="transparent"
                   strokeDasharray={ringCircumference}
                   strokeDashoffset={ringStrokeDashoffset}
                   strokeLinecap="round"
                   className="text-blue-500 dark:text-blue-400 transition-all duration-1000 ease-out"
                 />
               </svg>
               <div className="absolute text-xs font-bold text-blue-600 dark:text-blue-400">
                 {Math.round(goalPercentage)}%
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{(thisWeekMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">{(thisWeekMinutes / 60) === 1 ? 'hr' : 'hrs'}</span></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Trophy size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{(totalMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">{(totalMinutes / 60) === 1 ? 'hr' : 'hrs'}</span></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <Star size={20} />
            </div>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{avgRating} <span className="text-sm font-normal text-gray-400 dark:text-slate-500">/ 5</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Column */}
        <div className="lg:col-span-2 space-y-6">
          <Timer
            subjects={subjects}
            timerState={timerState}
            timerActions={timerActions}
            onSaveSession={onSaveSession}
            pomodoroSettings={pomodoroSettings}
          />
          <Heatmap sessions={sessions} />
          
          {/* Today's Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Today's Summary</h3>
             {todaySessions.length > 0 ? (
               <div className="space-y-4">
                 {/* Breakdown by subject */}
                 <div className="flex flex-wrap gap-3">
                   {subjects.map(sub => {
                     const subSess = todaySessions.filter(s => s.subjectId === sub.id);
                     if (subSess.length === 0) return null;
                     const subMins = subSess.reduce((a, b) => a + b.durationMinutes, 0);
                     const color = COLORS.find(c => c.id === sub.color);
                     return (
                       <div key={sub.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-opacity-10 dark:bg-opacity-20 ${color?.bgClass.replace('bg-', 'text-')}`}>
                         <div className={`w-2 h-2 rounded-full ${color?.bgClass}`}></div>
                         <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{sub.name}: {subMins} {subMins === 1 ? 'min' : 'mins'}</span>
                       </div>
                     );
                   })}
                 </div>
                 
                 {/* Learned list */}
                 <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-4">
                   <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">What You Learned</h4>
                   <ul className="space-y-3">
                     {todaySessions.map(s => {
                       const sub = subjects.find(sub => sub.id === s.subjectId);
                       const color = COLORS.find(c => c.id === sub?.color);
                       return (
                         <li key={s.id} className="flex gap-3">
                            <div className={`w-1 self-stretch rounded-full ${color?.bgClass || 'bg-gray-300 dark:bg-slate-600'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.topic}</p>
                              {s.notes && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.notes}</p>}
                            </div>
                         </li>
                       );
                     })}
                   </ul>
                 </div>
               </div>
             ) : (
               <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                 <p>No sessions completed today yet.</p>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Subjects Manager */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Subjects</h3>
              <button 
                onClick={openAddSubjectModal}
                className="p-2 bg-gray-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-indigo-500 transition-colors shadow-sm"
                title="Add Subject"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {subjects.map(subject => {
                const color = COLORS.find(c => c.id === subject.color);
                return (
                   <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-3 h-3 rounded-full ${color?.bgClass} flex-shrink-0`}></div>
                        <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
                         <span className="text-xs text-gray-400 dark:text-slate-500 mr-1 hidden sm:block">{(subject.weeklyTargetMinutes || 0) / 60}h/wk</span>
                         <button 
                           type="button"
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             openEditSubjectModal(subject);
                           }}
                           className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                           title="Edit"
                         >
                           <Pencil size={14} className="pointer-events-none" />
                         </button>
                         <button 
                           type="button"
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             onDeleteSubject(subject.id);
                           }}
                           className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                           title="Delete"
                         >
                           <Trash2 size={14} className="pointer-events-none" />
                         </button>
                      </div>
                   </div>
                );
              })}
              {subjects.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No subjects added</p>}
            </div>
          </div>
          
          {/* Weekly Goals Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Goals</h3>
             <div className="space-y-5">
               {subjects.map(subject => {
                 const currentMins = getSubjectProgress(subject.id);
                 const targetMins = subject.weeklyTargetMinutes || 0;
                 const progress = targetMins > 0 ? Math.min(100, (currentMins / targetMins) * 100) : 0;
                 const color = COLORS.find(c => c.id === subject.color);

                 return (
                   <div key={subject.id}>
                     <div className="flex justify-between text-sm mb-1">
                       <span className="font-medium text-gray-700 dark:text-gray-200">{subject.name}</span>
                       <span className="text-gray-500 dark:text-slate-400">{(currentMins / 60).toFixed(1)} / {(targetMins / 60).toFixed(1)} h</span>
                     </div>
                     <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                       <div
                         className={`h-2 rounded-full ${color?.bgClass} transition-all duration-500`}
                         style={{ width: `${progress}%` }}
                       ></div>
                     </div>
                   </div>
                 );
               })}
               {subjects.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500">Add subjects to track goals</p>}
             </div>
          </div>

          {/* To-Do / Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Study Tasks</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </div>

            <form onSubmit={handleTaskSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="Add new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 top-1.5 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600 rounded-md transition-colors"
              >
                <Plus size={16} />
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-slate-500 hover:text-indigo-500'}`}
                    >
                      {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <span className={`text-sm truncate ${task.completed ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-center text-gray-400 dark:text-slate-500 py-4">No active tasks. Add one to get started!</p>
              )}
            </div>
          </div>

          {/* Recent History Short List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
               {sessions.slice().reverse().slice(0, 5).map(session => {
                 const sub = subjects.find(s => s.id === session.subjectId);
                 const color = COLORS.find(c => c.id === sub?.color);
                 return (
                   <div key={session.id} className="flex gap-3 items-start pb-3 border-b border-gray-50 dark:border-slate-700 last:border-0 last:pb-0 group relative">
                     <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${color?.bgClass || 'bg-gray-300 dark:bg-slate-600'}`}></div>
                     <div className="w-full">
                        <div className="flex justify-between items-start w-full gap-4">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{sub?.name || 'Unknown'}</p>
                          <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">{format(new Date(session.date), 'MMM d')}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{session.topic}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-400 dark:text-slate-500">{session.rating}</span>
                            <span className="text-xs text-gray-300 dark:text-slate-600 mx-1">•</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">{session.durationMinutes} {session.durationMinutes === 1 ? 'min' : 'mins'}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                             <button 
                               type="button"
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 openEditSessionModal(session);
                               }} 
                               className="text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                             >
                               <Pencil size={12} className="pointer-events-none" />
                             </button>
                             <button 
                               type="button"
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 onDeleteSession(session.id);
                               }}
                               className="text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                             >
                               <Trash2 size={12} className="pointer-events-none" />
                             </button>
                          </div>
                        </div>
                     </div>
                   </div>
                 );
               })}
               {sessions.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No recent activity</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 transition-colors">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingSubjectId ? 'Edit Subject' : 'Add New Subject'}</h3>
               <button onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200">
                 <X size={24} />
               </button>
             </div>
             
             <form onSubmit={handleSubjectSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Subject Name</label>
                 <input 
                   type="text" 
                   value={subName}
                   onChange={(e) => setSubName(e.target.value)}
                   className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                   placeholder="e.g. Mathematics"
                   autoFocus
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color Label</label>
                 <div className="flex flex-wrap gap-3">
                   {COLORS.map(c => (
                     <button
                       key={c.id}
                       type="button"
                       onClick={() => setSubColor(c.id)}
                       className={`w-8 h-8 rounded-full ${c.bgClass} transition-all ${subColor === c.id ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                       title={c.label}
                     />
                   ))}
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Weekly Target (minutes)</label>
                 <input 
                   type="number" 
                   value={subTarget}
                   onChange={(e) => setSubTarget(Number(e.target.value))}
                   className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
                   step={30}
                   min={0}
                 />
                 <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Target: {(subTarget / 60).toFixed(1)} hours / week</p>
               </div>
               
               <div className="pt-2">
                 <button 
                   type="submit"
                   className="w-full py-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                 >
                   {editingSubjectId ? 'Update Subject' : 'Create Subject'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 transition-colors">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Session</h3>
               <button onClick={() => setIsSessionModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200">
                 <X size={24} />
               </button>
             </div>
             
             <form onSubmit={handleSessionSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Topic</label>
                 <input 
                   type="text" 
                   value={sessTopic}
                   onChange={(e) => setSessTopic(e.target.value)}
                   className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes</label>
                 <textarea 
                   value={sessNotes}
                   onChange={(e) => setSessNotes(e.target.value)}
                   rows={3}
                   className="w-full p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                 />
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSessRating(r)}
                        className={`p-1 rounded-full transition-all ${
                          sessRating >= r ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-slate-600'
                        }`}
                      >
                        <Star size={28} fill={sessRating >= r ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="pt-2">
                 <button 
                   type="submit"
                   className="w-full py-3 bg-gray-900 dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                 >
                   Save Changes
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Daily Goal Input Modal */}
      <InputModal
        isOpen={isDailyGoalModalOpen}
        onClose={() => setIsDailyGoalModalOpen(false)}
        onSubmit={handleDailyGoalSubmit}
        title="Set Daily Goal"
        message="Enter your daily study goal in hours:"
        defaultValue={(dailyGoal / 60).toString()}
        placeholder="e.g., 2.5"
        type="number"
        confirmText="Save Goal"
      />
    </div>
  );
};