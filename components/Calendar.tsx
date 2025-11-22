import React, { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Session, Subject } from '../types';
import { X, Plus, Clock, BookOpen } from 'lucide-react';

const localizer = momentLocalizer(moment);

interface CalendarProps {
  sessions: Session[];
  subjects: Subject[];
  onAddSession: (session: Omit<Session, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    session: Session;
    subject: Subject | undefined;
  };
}

interface NewSessionModal {
  isOpen: boolean;
  start: Date;
  end: Date;
}

export const Calendar: React.FC<CalendarProps> = ({ sessions, subjects, onAddSession }) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [newSessionModal, setNewSessionModal] = useState<NewSessionModal>({
    isOpen: false,
    start: new Date(),
    end: new Date(),
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Convert sessions to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return sessions.map((session) => {
      const subject = subjects.find((s) => s.id === session.subjectId);
      const startDate = new Date(session.date);
      const endDate = new Date(startDate.getTime() + session.durationMinutes * 60000);

      return {
        id: session.id,
        title: subject?.name || 'Unknown Subject',
        start: startDate,
        end: endDate,
        resource: {
          session,
          subject,
        },
      };
    });
  }, [sessions, subjects]);

  // Handle slot selection (clicking on empty calendar slot)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setNewSessionModal({
      isOpen: true,
      start: slotInfo.start,
      end: slotInfo.end,
    });
  }, []);

  // Handle creating new session
  const handleCreateSession = async () => {
    if (!selectedSubjectId) return;

    const durationMinutes = Math.round(
      (newSessionModal.end.getTime() - newSessionModal.start.getTime()) / 60000
    );

    // Use local date format to avoid timezone issues
    const startDate = newSessionModal.start;
    const localDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}T${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}:${String(startDate.getSeconds()).padStart(2, '0')}`;

    await onAddSession({
      subjectId: selectedSubjectId,
      date: localDate,
      durationMinutes,
      notes: '',
    });

    setNewSessionModal({ isOpen: false, start: new Date(), end: new Date() });
    setSelectedSubjectId('');
  };

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const subject = event.resource.subject;
    const bgColor = subject?.color || '#6366f1';
    
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '600',
        fontSize: '0.875rem',
      },
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Container */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '600px' }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          popup
        />
      </div>

      {/* New Session Modal */}
      {newSessionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={24} className="text-blue-500" />
                Schedule Study Session
              </h3>
              <button
                onClick={() => setNewSessionModal({ ...newSessionModal, isOpen: false })}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Time Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-semibold">Session Time</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {moment(newSessionModal.start).format('MMM D, YYYY • h:mm A')} - {moment(newSessionModal.end).format('h:mm A')}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Duration: {Math.round((newSessionModal.end.getTime() - newSessionModal.start.getTime()) / 60000)} minutes
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-500" />
                  Select Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-200 font-medium"
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setNewSessionModal({ ...newSessionModal, isOpen: false })}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!selectedSubjectId}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:shadow-none hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

