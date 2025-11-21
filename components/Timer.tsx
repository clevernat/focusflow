import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, Timer as TimerIcon, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw, Coffee, Zap } from 'lucide-react';
import { Subject, Session, TimerState, TimerActions } from '../types';
import { COLORS } from '../constants';

interface TimerProps {
  subjects: Subject[];
  timerState: TimerState;
  timerActions: TimerActions;
  onSaveSession: (sessionData: Omit<Session, 'id'>) => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  subjects, 
  timerState, 
  timerActions, 
  onSaveSession 
}) => {
  const { isActive, isPaused, seconds, totalSeconds, subjectId: selectedSubjectId, mode, isZenMode, audioEnabled } = timerState;
  const { start, pause, stop, reset, setSubjectId, setMode, setDuration, toggleZenMode, toggleAudio } = timerActions;

  // Local UI state for completion modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Session Details Form State
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(3);

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
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${isZenMode ? 'h-[500px] w-full max-w-2xl shadow-2xl' : 'min-h-[320px]'}`}>
      
      {/* Top Controls (Mode Switcher & Zen/Audio) */}
      {!showCompleteModal && (
        <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-start z-10">
           <div className="flex p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
             <button 
               onClick={() => setMode('stopwatch')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'stopwatch' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
             >
               Stopwatch
             </button>
             <button 
               onClick={() => setMode('timer')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'timer' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
             >
               Pomodoro
             </button>
           </div>

           <div className="flex gap-2">
             <button 
               onClick={toggleAudio}
               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
               title={audioEnabled ? "Mute Sounds" : "Enable Sounds"}
             >
               {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
             </button>
             <button 
               onClick={toggleZenMode}
               className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
               title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
             >
               {isZenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
             </button>
           </div>
        </div>
      )}

      {!showCompleteModal ? (
        <>
          <div className="mb-8 text-center relative mt-12">
            {/* Countdown SVG Circle */}
            {mode === 'timer' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-72 h-72 transform -rotate-90 opacity-10 dark:opacity-20">
                   <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-400" />
                </svg>
                <svg className="w-72 h-72 transform -rotate-90 absolute top-0 left-0">
                   <circle 
                     cx="144" cy="144" r="120" 
                     stroke="currentColor" 
                     strokeWidth="4" 
                     fill="transparent" 
                     strokeDasharray={circleCircumference}
                     strokeDashoffset={strokeDashoffset}
                     strokeLinecap="round"
                     className={`${isActive ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'} transition-all duration-1000 ease-linear`}
                   />
                </svg>
              </div>
            )}

            <h2 className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 relative z-10">
              {mode === 'stopwatch' ? 'Focus Time' : 'Time Remaining'}
            </h2>
            <div className={`font-mono font-bold text-gray-800 dark:text-white tracking-tight relative z-10 transition-all ${isZenMode ? 'text-8xl' : 'text-7xl'}`}>
              {formatTime(seconds)}
            </div>
            
            {/* Pomodoro Presets */}
            {mode === 'timer' && !isActive && seconds === totalSeconds && (
              <div className="flex gap-2 justify-center mt-4 relative z-10">
                <button onClick={() => setDuration(25 * 60)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full flex items-center gap-1 transition-colors text-gray-600 dark:text-gray-300">
                  <Zap size={12} /> Focus
                </button>
                <button onClick={() => setDuration(5 * 60)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full flex items-center gap-1 transition-colors text-gray-600 dark:text-gray-300">
                  <Coffee size={12} /> Short Break
                </button>
                <button onClick={() => setDuration(15 * 60)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full flex items-center gap-1 transition-colors text-gray-600 dark:text-gray-300">
                  <RefreshCw size={12} /> Long Break
                </button>
              </div>
            )}
          </div>

          <div className="w-full max-w-md space-y-6 relative z-10">
            {!isActive && (mode === 'stopwatch' ? seconds === 0 : seconds === totalSeconds) ? (
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-3 pl-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                >
                  <option value="" disabled>Select a Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400 dark:text-slate-500">
                   <TimerIcon size={20} />
                </div>
              </div>
            ) : (
              <div className={`text-center p-3 rounded-lg ${activeColor?.bgClass || 'bg-gray-100 dark:bg-slate-700'} bg-opacity-20 dark:bg-opacity-30 border ${activeColor ? activeColor.bgClass.replace('bg-', 'border-') : 'border-gray-200 dark:border-slate-600'} border-opacity-20 dark:border-opacity-30`}>
                <span className={`font-semibold ${activeColor?.textClass || 'text-gray-700 dark:text-gray-300'}`}>
                  Studying: {activeSubject?.name}
                </span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              {!isActive && (mode === 'stopwatch' ? seconds === 0 : seconds === totalSeconds) ? (
                <button
                  onClick={handleStart}
                  disabled={!selectedSubjectId}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium transition-all ${
                    selectedSubjectId 
                      ? 'bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 shadow-lg shadow-gray-200 dark:shadow-none scale-105' 
                      : 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Play size={20} fill="currentColor" />
                  Start Session
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStart} // Resume if paused
                    hidden={!isPaused && isActive}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800 font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                     <Play size={20} />
                     Resume
                  </button>
                  
                  <button
                    onClick={handlePause}
                    hidden={isPaused || !isActive}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800 font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    <Pause size={20} />
                    Pause
                  </button>

                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <CheckCircle2 size={20} />
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