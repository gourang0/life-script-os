import { useEffect, useState, useCallback } from 'react';
import { useReminderNotifications } from './useReminderNotifications';
import { useProfile } from './useProfile';
import { useDailyGoals } from './useDailyGoals';
import { useTasks } from './useTasks';

// Type declaration for Electron API exposed via preload
declare global {
  interface Window {
    electronAPI?: {
      showNotification: (title: string, body: string, urgency?: string) => Promise<void>;
      getAppInfo: () => Promise<{ version: string; name: string }>;
      getAutoLaunch: () => Promise<boolean>;
      setAutoLaunch: (enabled: boolean) => Promise<boolean>;
      updateTodayStats: (stats: TodayStats) => Promise<void>;
      onNavigate: (callback: (route: string) => void) => void;
      isElectron: boolean;
    };
  }
}

interface TodayStats {
  streak: number;
  xp: number;
  tasksCompleted: number;
  level: number;
  steps: number;
  workHours: number;
  sleepHours: number;
}

export function useElectronNotifications() {
  const { activeNotification } = useReminderNotifications();

  useEffect(() => {
    // Check if running in Electron
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      if (activeNotification) {
        const urgency = activeNotification.priority >= 3 ? 'critical' : 
                       activeNotification.priority === 2 ? 'normal' : 'low';
        
        window.electronAPI.showNotification(
          '⚡ Reminder Alert!',
          activeNotification.content,
          urgency
        );
      }
    }
  }, [activeNotification]);

  return {
    isElectron: typeof window !== 'undefined' && !!window.electronAPI?.isElectron
  };
}

// Hook to handle navigation from Electron tray menu
export function useElectronNavigation() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      window.electronAPI.onNavigate((route: string) => {
        // Use window.location for navigation since we might not have router context
        window.location.href = route;
      });
    }
  }, []);
}

// Hook to manage auto-launch setting
export function useAutoLaunch() {
  const [autoLaunch, setAutoLaunchState] = useState(false);
  const [loading, setLoading] = useState(true);
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (isElectron) {
      window.electronAPI!.getAutoLaunch().then((enabled) => {
        setAutoLaunchState(enabled);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isElectron]);

  const setAutoLaunch = useCallback(async (enabled: boolean) => {
    if (isElectron) {
      await window.electronAPI!.setAutoLaunch(enabled);
      setAutoLaunchState(enabled);
    }
  }, [isElectron]);

  return { autoLaunch, setAutoLaunch, loading, isElectron };
}

// Hook to sync today's stats to Electron tray widget
export function useTrayStatsSync() {
  const { data: profile } = useProfile();
  const { data: dailyGoals } = useDailyGoals();
  const { data: tasks } = useTasks();
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (!isElectron || !profile) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayGoal = dailyGoals?.find(g => g.goal_date === todayDate);
    const todayTasks = tasks?.filter(t => t.is_completed && t.completed_at?.startsWith(todayDate)) || [];

    const stats: TodayStats = {
      streak: profile.current_streak || 0,
      xp: profile.xp_points || 0,
      tasksCompleted: todayTasks.length,
      level: profile.level || 1,
      steps: todayGoal?.steps_actual || 0,
      workHours: todayGoal?.work_hours_actual || 0,
      sleepHours: todayGoal?.sleep_hours_actual || 0
    };

    window.electronAPI!.updateTodayStats(stats);
  }, [profile, dailyGoals, tasks, isElectron]);
}
