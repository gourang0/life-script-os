import { useEffect } from 'react';
import { useReminderNotifications } from './useReminderNotifications';

// Type declaration for Electron API exposed via preload
declare global {
  interface Window {
    electronAPI?: {
      showNotification: (title: string, body: string, urgency?: string) => Promise<void>;
      getAppInfo: () => Promise<{ version: string; name: string }>;
      onNavigate: (callback: (route: string) => void) => void;
      isElectron: boolean;
    };
  }
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
