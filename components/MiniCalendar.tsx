import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Session, Subject } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface MiniCalendarProps {
  sessions: Session[];
  subjects: Subject[];
  onDateClick?: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ sessions, subjects, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all days to display in calendar (including padding days from prev/next month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return isSameDay(sessionDate, day);
    });
  };

  // Get total minutes for a day
  const getTotalMinutesForDay = (day: Date) => {
    const daySessions = getSessionsForDay(day);
    return daySessions.reduce((total, session) => total + session.durationMinutes, 0);
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const daySessions = getSessionsForDay(day);
          const totalMinutes = getTotalMinutesForDay(day);
          const hasSession = daySessions.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={index}
              onClick={() => onDateClick?.(day)}
              className={`
                relative aspect-square p-1 rounded-lg text-sm font-semibold transition-all
                ${isCurrentMonth ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}
                ${isTodayDate ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg' : ''}
                ${!isTodayDate && hasSession ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' : ''}
                ${!isTodayDate && !hasSession ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{format(day, 'd')}</span>
                {hasSession && !isTodayDate && (
                  <div className="flex gap-0.5 mt-1">
                    {daySessions.slice(0, 3).map((session, i) => {
                      const subject = subjects.find((s) => s.id === session.subjectId);
                      return (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: subject?.color || '#6366f1' }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              {hasSession && totalMinutes > 0 && (
                <div className="absolute bottom-0 left-0 right-0 text-[0.6rem] font-bold opacity-70">
                  {Math.round(totalMinutes / 60)}h
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-indigo-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800"></div>
            <span className="text-slate-600 dark:text-slate-400">Has Sessions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

