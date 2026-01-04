import { useEffect, useState, useCallback } from 'react';
import { useReminders, Reminder } from './useReminders';

export function useReminderNotifications() {
  const { data: reminders } = useReminders();
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    // Check for due reminders every second
    const checkReminders = () => {
      const now = new Date();
      
      reminders.forEach((reminder) => {
        if (!reminder.reminder_time || notifiedIds.has(reminder.id)) return;
        
        const reminderTime = new Date(reminder.reminder_time);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Trigger notification if within 1 second of the reminder time
        if (timeDiff <= 1000 && timeDiff > -60000) { // Within 1 minute window
          setActiveNotification(reminder);
          setNotifiedIds((prev) => new Set([...prev, reminder.id]));
        }
      });
    };

    const interval = setInterval(checkReminders, 1000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders, notifiedIds]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    activeNotification,
    dismissNotification,
  };
}
