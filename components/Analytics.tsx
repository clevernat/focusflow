import React, { useMemo, useState } from 'react';
import { Subject, Session } from '../types';
import { COLORS } from '../constants';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, isSameDay, getHours, startOfMonth, endOfMonth } from 'date-fns';
import { FileDown, Calendar } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import StreakDisplay from './StreakDisplay';
import type { StudyStreak } from '../lib/supabase';

interface AnalyticsProps {
  sessions: Session[];
  subjects: Subject[];
  isDarkMode: boolean;
  streak?: StudyStreak | null;
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, subjects, isDarkMode, streak }) => {
  // --- 1. Trend Data (Last 30 Days) ---
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const daySessions = sessions.filter(s => isSameDay(new Date(s.date), date));
      const hours = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;
      data.push({
        date: format(date, 'MMM dd'),
        hours: Number(hours.toFixed(2))
      });
    }
    return data;
  }, [sessions]);

  // --- 2. Subject Distribution (Pie) ---
  const subjectDistData = useMemo(() => {
    return subjects.map(sub => {
      const totalMins = sessions
        .filter(s => s.subjectId === sub.id)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      const color = COLORS.find(c => c.id === sub.color)?.hex || '#ccc';
      return { name: sub.name, value: totalMins, color };
    }).filter(d => d.value > 0);
  }, [sessions, subjects]);

  // --- 3. Productivity By Time of Day ---
  const timeAnalysisData = useMemo(() => {
    const buckets = [
      { name: 'Morning (6-12)', start: 6, end: 12, count: 0, totalRating: 0 },
      { name: 'Afternoon (12-17)', start: 12, end: 17, count: 0, totalRating: 0 },
      { name: 'Evening (17-22)', start: 17, end: 22, count: 0, totalRating: 0 },
      { name: 'Night (22-6)', start: 22, end: 6, count: 0, totalRating: 0 }, // simplified
    ];

    sessions.forEach(s => {
      const hour = getHours(new Date(s.date));
      let bucket;
      if (hour >= 6 && hour < 12) bucket = buckets[0];
      else if (hour >= 12 && hour < 17) bucket = buckets[1];
      else if (hour >= 17 && hour < 22) bucket = buckets[2];
      else bucket = buckets[3];

      bucket.count++;
      bucket.totalRating += s.rating;
    });

    return buckets.map(b => ({
      name: b.name,
      avgRating: b.count > 0 ? Number((b.totalRating / b.count).toFixed(1)) : 0,
      sessions: b.count
    }));
  }, [sessions]);

  // Theme variables
  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const axisColor = isDarkMode ? '#94a3b8' : '#94a3b8';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#f1f5f9';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  const [exportRange, setExportRange] = useState<'all' | 'month' | 'custom'>('month');

  const handleExportPDF = () => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (exportRange === 'month') {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    }

    exportToPDF(sessions, subjects, { startDate, endDate });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Export Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Analytics & Reports</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track your study progress and patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={exportRange}
            onChange={(e) => setExportRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Streak Display */}
      {streak && (
        <StreakDisplay streak={streak} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Study Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-96 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Study Time Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" hide />
              <YAxis stroke={axisColor} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  borderColor: tooltipBorder,
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: tooltipText
                }}
                itemStyle={{ color: tooltipText }}
              />
              <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-96 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Time Distribution by Subject</h3>
          {subjectDistData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={subjectDistData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                   stroke={isDarkMode ? '#1e293b' : '#fff'} // Match bg color
                 >
                   {subjectDistData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: tooltipBg, 
                     borderColor: tooltipBorder,
                     borderRadius: '8px',
                     color: tooltipText
                   }}
                   itemStyle={{ color: tooltipText }}
                 />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">No data available</div>
          )}
        </div>
        
        {/* Best Time to Study */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-96 transition-colors">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Productivity by Time of Day</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={timeAnalysisData} layout="vertical">
               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
               <XAxis type="number" domain={[0, 5]} hide />
               <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: axisColor}} />
               <Tooltip 
                 cursor={{fill: isDarkMode ? '#334155' : '#f8fafc'}}
                 contentStyle={{ 
                   backgroundColor: tooltipBg, 
                   borderColor: tooltipBorder,
                   borderRadius: '8px',
                   color: tooltipText
                 }}
                 itemStyle={{ color: tooltipText }}
               />
               <Bar dataKey="avgRating" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={30} />
             </BarChart>
           </ResponsiveContainer>
        </div>

        {/* Subject Performance List */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 h-96 overflow-y-auto transition-colors">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subject Performance</h3>
           <div className="space-y-4">
             {subjects.map(sub => {
               const subSessions = sessions.filter(s => s.subjectId === sub.id);
               const count = subSessions.length;
               const totalHours = subSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;
               const avgR = count > 0 ? (subSessions.reduce((acc,s) => acc + s.rating, 0) / count).toFixed(1) : 'N/A';
               const color = COLORS.find(c => c.id === sub.color);

               return (
                 <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-lg ${color?.bgClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-lg font-bold ${color?.textClass}`}>
                       {sub.name.charAt(0)}
                     </div>
                     <div>
                       <div className="font-medium text-gray-800 dark:text-gray-200">{sub.name}</div>
                       <div className="text-xs text-gray-500 dark:text-slate-400">{count} sessions</div>
                     </div>
                   </div>
                   <div className="text-right">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{typeof avgR === 'string' ? avgR : avgR + ' ⭐'}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{totalHours.toFixed(1)} hours</div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

      </div>
    </div>
  );
};