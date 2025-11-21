import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../lib/supabase';
import { ConfirmModal } from './Modal';
import { useModal } from '../hooks/useModal';

interface RemindersPanelProps {
  userId: string;
}

export default function RemindersPanel({ userId }: RemindersPanelProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal management
  const { confirmState, showConfirm, closeConfirm } = useModal();

  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '09:00',
    days_of_week: [1, 2, 3, 4, 5] // Monday to Friday
  });

  // Update current time every second for display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const sendReminderNotification = async (title: string) => {
    console.log('🔔 sendReminderNotification called with title:', title);

    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported in this browser');
      return;
    }

    console.log('📢 Notification permission:', Notification.permission);

    try {
      if (Notification.permission === 'granted') {
        console.log('✅ Permission granted, sending notification...');
        const notification = new Notification('🔔 FocusFlow Reminder', {
          body: title,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: 'study-reminder-' + Date.now(), // Unique tag to allow multiple notifications
          requireInteraction: true, // Keeps notification visible until user interacts
          silent: false // Make sure it makes a sound
        });

        notification.onshow = () => {
          console.log('✅ Reminder notification is showing!');
        };

        notification.onerror = (error) => {
          console.error('❌ Reminder notification error:', error);
        };

        console.log('✅ Notification created:', notification);
      } else if (Notification.permission === 'denied') {
        console.error('❌ Notification permission denied');
      } else {
        console.log('⚠️ Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('📢 Permission result:', permission);
        if (permission === 'granted') {
          const notification = new Notification('🔔 FocusFlow Reminder', {
            body: title,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: 'study-reminder-' + Date.now(),
            requireInteraction: true,
            silent: false
          });

          notification.onshow = () => {
            console.log('✅ Reminder notification is showing!');
          };

          notification.onerror = (error) => {
            console.error('❌ Reminder notification error:', error);
          };

          console.log('✅ Notification created after permission:', notification);
        }
      }
    } catch (error) {
      console.error('❌ Error sending reminder notification:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('time');

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time) {
      alert('Please fill in both title and time');
      return;
    }

    if (newReminder.days_of_week.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const reminderData = {
      user_id: userId,
      title: newReminder.title,
      time: newReminder.time,
      days_of_week: newReminder.days_of_week,
      enabled: true
    };

    console.log('💾 Saving reminder to database:', reminderData);

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert(reminderData)
        .select();

      if (error) throw error;

      console.log('✅ Reminder saved successfully:', data);
      alert(`✅ Reminder created!\n\nTitle: ${newReminder.title}\nTime: ${newReminder.time}\nDays: ${newReminder.days_of_week.join(', ')}\n\nIt will fire when the time matches!`);

      setNewReminder({ title: '', time: '09:00', days_of_week: [1, 2, 3, 4, 5] });
      setShowAddForm(false);
      fetchReminders();
    } catch (error) {
      console.error('❌ Error adding reminder:', error);
      alert('Failed to add reminder: ' + (error as Error).message);
    }
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ enabled: !enabled })
        .eq('id', id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setNewReminder({
      title: reminder.title,
      time: reminder.time,
      days_of_week: reminder.days_of_week
    });
    setShowAddForm(true);
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          title: newReminder.title,
          time: newReminder.time,
          days_of_week: newReminder.days_of_week
        })
        .eq('id', editingReminder.id);

      if (error) throw error;

      setNewReminder({ title: '', time: '09:00', days_of_week: [1, 2, 3, 4, 5] });
      setShowAddForm(false);
      setEditingReminder(null);
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Failed to update reminder: ' + (error as Error).message);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    const reminderTitle = reminder?.title || 'this reminder';

    showConfirm(
      `Are you sure you want to delete "${reminderTitle}"?`,
      async () => {
        try {
          const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', id);

          if (error) throw error;
          fetchReminders();
        } catch (error) {
          console.error('Error deleting reminder:', error);
        }
      },
      'Delete Reminder',
      'warning',
      'Delete',
      'Cancel'
    );
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
            <Bell className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Study Reminders</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Schedule notifications to stay on track
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              setEditingReminder(null);
              setNewReminder({ title: '', time: '09:00', days_of_week: [1, 2, 3, 4, 5] });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {/* Current Time Display */}
      <div className="mb-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Current Time (Updates every second)</p>
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} (Day {currentTime.getDay()})
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✓ Reminder checker is running (checks every 10 seconds)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                console.log('🔔 Manual notification test clicked');
                sendReminderNotification('Test reminder - this is how your reminders will look!');
              }}
              className="text-xs px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Test Notification
            </button>
            <button
              onClick={() => {
                console.log('🔍 Manual reminder check triggered');
                console.log('Current reminders:', reminders);
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                const currentDay = now.getDay();
                console.log('Current time:', currentTime, 'Day:', currentDay);

                reminders.forEach(reminder => {
                  console.log('Checking:', reminder.title);
                  console.log('  - Reminder time:', reminder.time);
                  console.log('  - Current time:', currentTime);
                  console.log('  - Match:', reminder.time === currentTime);
                  console.log('  - Reminder days:', reminder.days_of_week);
                  console.log('  - Current day:', currentDay);
                  console.log('  - Day match:', reminder.days_of_week.includes(currentDay));
                  console.log('  - Enabled:', reminder.enabled);

                  if (reminder.enabled && reminder.time === currentTime && reminder.days_of_week.includes(currentDay)) {
                    console.log('✅ SHOULD FIRE NOW!');
                    sendReminderNotification(reminder.title);
                  }
                });
              }}
              className="text-xs px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              Check Now
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-green-700 dark:text-green-300">
            ✅ <strong>Reminders are active!</strong> They work on all pages - you can switch tabs freely. Checking every 10 seconds.
          </p>
          <button
            onClick={async () => {
              const now = new Date();
              const testTime = new Date(now.getTime() + 60000); // 1 minute from now
              const timeStr = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
              const currentDay = now.getDay();

              console.log('🧪 Creating quick test reminder for:', timeStr, 'on day', currentDay);

              try {
                const { data, error } = await supabase
                  .from('reminders')
                  .insert({
                    user_id: userId,
                    title: '🧪 Quick Test - Delete Me',
                    time: timeStr,
                    days_of_week: [currentDay],
                    enabled: true
                  })
                  .select();

                if (error) throw error;

                console.log('✅ Test reminder created:', data);
                alert(`✅ Test reminder created!\n\nWill fire at: ${timeStr}\nCurrent time: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}\n\nWatch the console and wait 1 minute!`);
                fetchReminders();
              } catch (error) {
                console.error('❌ Error creating test reminder:', error);
                alert('Failed to create test reminder');
              }
            }}
            className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Quick Test (1 min)
          </button>
        </div>
      </div>

      {/* Add/Edit Reminder Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
            {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
          </h3>

          {/* Title Input */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Title
            </label>
            <input
              type="text"
              placeholder="e.g., 'Study Math', 'Take a break'"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Input */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time (24-hour format)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Current: {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Will be saved as: <strong className="text-indigo-600 dark:text-indigo-400">{newReminder.time}</strong>
            </p>
          </div>

          {/* Days of Week */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat on (Current day: {currentTime.getDay()})
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { day: 0, label: 'Sun' },
                { day: 1, label: 'Mon' },
                { day: 2, label: 'Tue' },
                { day: 3, label: 'Wed' },
                { day: 4, label: 'Thu' },
                { day: 5, label: 'Fri' },
                { day: 6, label: 'Sat' }
              ].map(({ day, label }) => (
                <button
                  key={day}
                  onClick={() => {
                    const days = newReminder.days_of_week.includes(day)
                      ? newReminder.days_of_week.filter(d => d !== day)
                      : [...newReminder.days_of_week, day].sort();
                    setNewReminder({ ...newReminder, days_of_week: days });
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    newReminder.days_of_week.includes(day)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600'
                  } ${day === currentTime.getDay() ? 'ring-2 ring-green-500' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Selected days: <strong className="text-indigo-600 dark:text-indigo-400">{newReminder.days_of_week.join(', ')}</strong>
            </p>
          </div>

          {/* Preview */}
          <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Preview:</p>
            <p className="text-sm text-gray-800 dark:text-white">
              "{newReminder.title || '(no title)'}" at <strong>{newReminder.time}</strong> on days <strong>{newReminder.days_of_week.join(', ')}</strong>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingReminder(null);
                setNewReminder({ title: '', time: '09:00', days_of_week: [1, 2, 3, 4, 5] });
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingReminder ? handleUpdateReminder : handleAddReminder}
              disabled={!newReminder.title || newReminder.days_of_week.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingReminder ? 'Update Reminder' : 'Save Reminder'}
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reminders yet. Click "Add" to create one!</p>
          </div>
        ) : (
          reminders.map((reminder) => {
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const reminderDays = reminder.days_of_week.map(d => dayLabels[d]).join(', ');

            // Check if this reminder will fire today
            const now = new Date();
            const currentDay = now.getDay();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const reminderTime = reminder.time.substring(0, 5); // Normalize to HH:MM
            const isToday = reminder.days_of_week.includes(currentDay);
            const timeHasPassed = reminderTime < currentTime;
            const willFireToday = isToday && !timeHasPassed && reminder.enabled;
            const missedToday = isToday && timeHasPassed;

            return (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  willFireToday
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => handleToggleReminder(reminder.id, reminder.enabled)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${reminder.enabled ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-slate-500 line-through'}`}>
                        {reminder.title}
                      </h3>
                      {willFireToday && (
                        <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                          Will fire today!
                        </span>
                      )}
                      {missedToday && (
                        <span className="text-xs px-2 py-0.5 bg-orange-600 text-white rounded-full">
                          Missed (time passed)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-slate-400">{reminderTime}</span>
                        <span className="text-xs text-gray-400">(now: {currentTime})</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{reminderDays}</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">Days: {reminder.days_of_week.join(', ')}</span>
                      {isToday && (
                        <>
                          <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Today!</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditReminder(reminder)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit reminder"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {reminders.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-slate-400">No reminders set</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Click "Add" to create your first reminder</p>
          </div>
        )}
      </div>

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
}

