import { useEffect, useState } from 'react';
import { supabase, Reminder } from '../lib/supabase';

export function useReminderChecker(userId: string | undefined) {
  const [firedReminders, setFiredReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

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

          notification.onclick = () => {
            console.log('✅ Reminder notification clicked!');
            window.focus();
            notification.close();
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

    const checkReminders = async () => {
      try {
        // Fetch reminders from database
        const { data: reminders, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .eq('enabled', true);

        if (error) {
          console.error('Error fetching reminders:', error);
          return;
        }

        if (!reminders || reminders.length === 0) {
          return;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();
        const currentMinuteKey = `${currentTime}-${currentDay}`;

        console.log('🔔 [Background] Checking reminders at:', currentTime, 'Day:', currentDay);
        console.log('📋 [Background] Active reminders:', reminders.length);

        reminders.forEach((reminder: Reminder) => {
          const reminderKey = `${reminder.id}-${currentMinuteKey}`;
          const reminderTime = reminder.time.substring(0, 5);
          const timeMatches = reminderTime === currentTime;
          const dayMatches = reminder.days_of_week.includes(currentDay);
          const alreadyFired = firedReminders.has(reminderKey);

          console.log(`📌 [Background] "${reminder.title}": time=${reminderTime} (match: ${timeMatches}), day=${currentDay} (match: ${dayMatches}), fired: ${alreadyFired}`);

          if (timeMatches && dayMatches && !alreadyFired) {
            console.log('✅ ✅ ✅ [Background] REMINDER MATCHED! Sending notification:', reminder.title);
            sendReminderNotification(reminder.title);
            setFiredReminders(prev => new Set(prev).add(reminderKey));
          }
        });
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    // Check immediately
    checkReminders();

    // Then check every 10 seconds
    const interval = setInterval(checkReminders, 10000);

    return () => clearInterval(interval);
  }, [userId, firedReminders]);

  // Clear fired reminders every minute
  useEffect(() => {
    const clearFiredReminders = () => {
      console.log('🧹 [Background] Clearing fired reminders cache');
      setFiredReminders(new Set());
    };

    const interval = setInterval(clearFiredReminders, 60000);
    return () => clearInterval(interval);
  }, []);
}

