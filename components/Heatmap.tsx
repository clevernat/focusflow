import React, { useMemo } from 'react';
import { Session } from '../types';
import { format, subDays, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

interface HeatmapProps {
  sessions: Session[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ sessions }) => {
  // Generate last ~120 days (approx 4 months)
  const daysToRender = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 119); // 17 weeks approx
    // Align start date to a Sunday/Monday depending on preference, here we just take raw range
    // Ideally align to start of week for the grid to look perfect
    const alignedStart = startOfWeek(startDate);
    const alignedEnd = endOfWeek(today);
    
    return eachDayOfInterval({ start: alignedStart, end: alignedEnd });
  }, []);

  // Create a map for O(1) lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach(session => {
      const dateKey = format(new Date(session.date), 'yyyy-MM-dd');
      const current = map.get(dateKey) || 0;
      map.set(dateKey, current + session.durationMinutes);
    });
    return map;
  }, [sessions]);

  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-100 dark:bg-slate-700';
    if (minutes < 30) return 'bg-green-200 dark:bg-green-900';
    if (minutes < 60) return 'bg-green-300 dark:bg-green-700';
    if (minutes < 120) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  // Group by weeks for the grid columns
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];
    
    daysToRender.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeksArray.push(currentWeek);
    return weeksArray;
  }, [daysToRender]);

  // Calculate total active days
  const activeDayCount = useMemo(() => {
    const uniqueDays = new Set(sessions.map(s => format(new Date(s.date), 'yyyy-MM-dd')));
    return uniqueDays.size;
  }, [sessions]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Study Activity</h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">{activeDayCount} days studied recently</span>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Week columns */}
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1">
            {week.map((day, dIndex) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const minutes = activityMap.get(dateKey) || 0;
              return (
                <div
                  key={dateKey}
                  className={`w-3 h-3 rounded-sm ${getColor(minutes)} transition-colors duration-200`}
                  title={`${format(day, 'MMM d, yyyy')}: ${minutes} mins`}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-slate-500 justify-end">
        <span>Less</span>
        <div className="w-3 h-3 bg-gray-100 dark:bg-slate-700 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
};