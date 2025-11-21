import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, Timer as TimerIcon, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw, Coffee, Zap } from 'lucide-react';
import { Subject, Session, TimerState, TimerActions } from '../types';
import { COLORS } from '../constants';

interface TimerProps {
  subjects: Subject[];
  timerState: TimerState;
  timerActions: TimerActions;
  onSaveSession: (sessionData: Omit<Session, 'id'>) => void;
  pomodoroSettings?: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
  };
}

export const Timer: React.FC<TimerProps> = ({
  subjects,
  timerState,
  timerActions,
  onSaveSession,
  pomodoroSettings = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 }
}) => {
  const { isActive, isPaused, seconds, totalSeconds, subjectId: selectedSubjectId, mode, isZenMode, audioEnabled } = timerState;
  const { start, pause, stop, reset, setSubjectId, setMode, setDuration, toggleZenMode, toggleAudio } = timerActions;

  // Local UI state for completion modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Session Details Form State
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);

  // Custom duration input
  const [customMinutes, setCustomMinutes] = useState<string>('');

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedSubjectId) return;
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleComplete = () => {
    // For Stopwatch, we stop and save. 
    // For Timer, if it's unfinished, we treat it as a completion with current duration.
    stop(); 
    setShowCompleteModal(true);
  };

  const handleSave = () => {
    // Calculate duration:
    // If Stopwatch: seconds
    // If Timer: totalSeconds - seconds
    const durationSecs = mode === 'stopwatch' ? seconds : (totalSeconds - seconds);
    
    onSaveSession({
      subjectId: selectedSubjectId,
      date: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round(durationSecs / 60)), // Minimum 1 min
      topic: topic || (mode === 'timer' ? 'Pomodoro Session' : 'General Study'),
      notes,
      rating
    });
    // Reset Global Timer
    reset();
    // Reset Local Form
    setShowCompleteModal(false);
    setTopic('');
    setNotes('');
    setRating(3);
  };

  const handleCancel = () => {
    // Reset Global Timer
    reset();
    // Reset Local Form
    setShowCompleteModal(false);
    setTopic('');
    setNotes('');
    setRating(3);
  };

  // Calculate progress percentage for countdown
  const progressPercentage = mode === 'timer' && totalSeconds > 0 
    ? ((totalSeconds - seconds) / totalSeconds) * 100 
    : 0;
    
  const circleRadius = 120;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeColor = activeSubject ? COLORS.find(c => c.id === activeSubject.color) : null;

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${isZenMode ? 'h-[500px] w-full max-w-2xl shadow-2xl' : 'min-h-[320px]'}`}>

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50 pointer-events-none"></div>

      {/* Top Controls (Mode Switcher & Zen/Audio) */}
      {!showCompleteModal && (
        <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-start z-10">
           <div className="flex p-1.5 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-600">
             <button
               onClick={() => setMode('stopwatch')}
               className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'stopwatch' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600'}`}
             >
               Stopwatch
             </button>
             <button
               onClick={() => setMode('timer')}
               className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'timer' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600'}`}
             >
               Pomodoro
             </button>
           </div>

           <div className="flex gap-2">
             <button
               onClick={toggleAudio}
               className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
               title={audioEnabled ? "Mute Sounds" : "Enable Sounds"}
             >
               {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             <button
               onClick={toggleZenMode}
               className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all rounded-xl hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
               title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
             >
               {isZenMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
             </button>
           </div>
        </div>
      )}

      {!showCompleteModal ? (
        <>
          <div className="mb-12 text-center relative mt-16 pb-8">
            {/* Countdown SVG Circle */}
            {mode === 'timer' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                {/* Background circle */}
                <svg className="w-80 h-80 transform -rotate-90">
                   <circle cx="160" cy="160" r="130" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700 opacity-30" />
                </svg>
                {/* Progress circle */}
                <svg className="w-80 h-80 transform -rotate-90 absolute top-0 left-0">
                   <circle
                     cx="160" cy="160" r="130"
                     stroke="url(#gradient)"
                     strokeWidth="8"
                     fill="transparent"
                     strokeDasharray={circleCircumference}
                     strokeDashoffset={strokeDashoffset}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-linear drop-shadow-lg"
                   />
                   <defs>
                     <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#3b82f6" />
                       <stop offset="50%" stopColor="#8b5cf6" />
                       <stop offset="100%" stopColor="#ec4899" />
                     </linearGradient>
                   </defs>
                </svg>
              </div>
            )}

            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 relative z-10 opacity-70">
              {mode === 'stopwatch' ? 'Focus Time' : 'Time Remaining'}
            </h2>
            <div className={`font-mono font-black bg-gradient-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent tracking-tight relative z-10 transition-all drop-shadow-sm ${isZenMode ? 'text-8xl' : 'text-7xl'}`}>
              {formatTime(seconds)}
            </div>
            
            {/* Pomodoro Presets */}
            {mode === 'timer' && !isActive && seconds === totalSeconds && (
              <div className="space-y-4 mt-6 relative z-10">
                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setDuration(pomodoroSettings.focusMinutes * 60)}
                    className="group relative px-5 py-3 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white rounded-2xl flex items-center gap-2.5 transition-all shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 active:scale-95 border border-blue-400/20"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Zap size={16} className="group-hover:animate-pulse relative z-10" />
                    <span className="font-bold text-sm relative z-10">Focus</span>
                    <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded-full relative z-10">{pomodoroSettings.focusMinutes}m</span>
                  </button>
                  <button
                    onClick={() => setDuration(pomodoroSettings.shortBreakMinutes * 60)}
                    className="group relative px-5 py-3 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white rounded-2xl flex items-center gap-2.5 transition-all shadow-xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105 active:scale-95 border border-green-400/20"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Coffee size={16} className="group-hover:animate-pulse relative z-10" />
                    <span className="font-bold text-sm relative z-10">Short Break</span>
                    <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded-full relative z-10">{pomodoroSettings.shortBreakMinutes}m</span>
                  </button>
                  <button
                    onClick={() => setDuration(pomodoroSettings.longBreakMinutes * 60)}
                    className="group relative px-5 py-3 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-600 hover:from-purple-600 hover:via-violet-700 hover:to-fuchsia-700 text-white rounded-2xl flex items-center gap-2.5 transition-all shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95 border border-purple-400/20"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <RefreshCw size={16} className="group-hover:animate-pulse relative z-10" />
                    <span className="font-bold text-sm relative z-10">Long Break</span>
                    <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded-full relative z-10">{pomodoroSettings.longBreakMinutes}m</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">Custom</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
                </div>

                {/* Custom Duration Input */}
                <div className="flex items-center justify-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      placeholder="Enter minutes..."
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customMinutes) {
                          const mins = parseInt(customMinutes);
                          if (mins > 0 && mins <= 999) {
                            setDuration(mins * 60);
                            setCustomMinutes('');
                          }
                        }
                      }}
                      className="w-full px-5 py-3.5 text-base bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-center focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-semibold shadow-sm hover:shadow-md"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                      min
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (customMinutes) {
                        const mins = parseInt(customMinutes);
                        if (mins > 0 && mins <= 999) {
                          setDuration(mins * 60);
                          setCustomMinutes('');
                        }
                      }
                    }}
                    disabled={!customMinutes || parseInt(customMinutes) <= 0}
                    className="px-7 py-3.5 text-sm font-bold bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60 disabled:shadow-none hover:scale-105 active:scale-95 disabled:scale-100 border border-indigo-400/20 disabled:border-0"
                  >
                    Set Timer
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-md space-y-6 relative z-10 mt-8">
            {!isActive && (mode === 'stopwatch' ? seconds === 0 : seconds === totalSeconds) ? (
              <div className="relative group">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-4 pl-5 pr-12 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <option value="" disabled>Select a Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                   <TimerIcon size={22} />
                </div>
              </div>
            ) : (
              <div className={`text-center p-4 rounded-xl ${activeColor?.bgClass || 'bg-slate-100 dark:bg-slate-700'} bg-opacity-20 dark:bg-opacity-30 border-2 ${activeColor ? activeColor.bgClass.replace('bg-', 'border-') : 'border-slate-200 dark:border-slate-600'} border-opacity-30 dark:border-opacity-30 shadow-sm backdrop-blur-sm`}>
                <span className={`font-bold text-base ${activeColor?.textClass || 'text-slate-700 dark:text-slate-300'}`}>
                  Studying: {activeSubject?.name}
                </span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isActive && (mode === 'stopwatch' ? seconds === 0 : seconds === totalSeconds) ? (
                <button
                  onClick={handleStart}
                  disabled={!selectedSubjectId}
                  className={`group flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-xl ${
                    selectedSubjectId
                      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 active:scale-95 border border-blue-400/20'
                      : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none border-0'
                  }`}
                >
                  <Play size={22} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  Start Session
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStart} // Resume if paused
                    hidden={!isPaused && isActive}
                    className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/30 dark:to-amber-900/30 text-amber-700 dark:text-yellow-400 border-2 border-amber-200 dark:border-yellow-800 font-bold hover:from-amber-100 hover:to-yellow-100 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                     <Play size={20} className="group-hover:scale-110 transition-transform" />
                     Resume
                  </button>

                  <button
                    onClick={handlePause}
                    hidden={isPaused || !isActive}
                    className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-yellow-900/30 dark:to-amber-900/30 text-amber-700 dark:text-yellow-400 border-2 border-amber-200 dark:border-yellow-800 font-bold hover:from-amber-100 hover:to-yellow-100 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Pause size={20} className="group-hover:scale-110 transition-transform" />
                    Pause
                  </button>

                  <button
                    onClick={handleComplete}
                    className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-green-900/30 dark:to-emerald-900/30 text-emerald-700 dark:text-green-400 border-2 border-emerald-200 dark:border-green-800 font-bold hover:from-emerald-100 hover:to-green-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                    {mode === 'timer' && seconds === 0 ? 'Finish' : 'Complete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-6">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
               <CheckCircle2 size={32} />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Session Complete!</h3>
             <p className="text-gray-500 dark:text-slate-400">
                {mode === 'stopwatch' ? formatTime(seconds) : formatTime(totalSeconds - seconds)} of focus time
             </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">What did you study?</label>
              <input
                type="text"
                placeholder="e.g., Quadratic Equations"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Key takeaways..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Productivity Rating</label>
              <div className="flex gap-2 justify-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={`p-2 rounded-full transition-all ${
                      rating >= r ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-slate-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                 onClick={handleCancel}
                 className="flex-1 py-3 px-4 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Discard
              </button>
              <button
                 onClick={handleSave}
                 className="flex-1 py-3 px-4 rounded-lg bg-gray-900 dark:bg-indigo-600 text-white font-medium hover:bg-gray-800 dark:hover:bg-indigo-500 shadow-lg shadow-gray-200 dark:shadow-none"
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};