import { useEffect, useCallback } from 'react';
import { useCreateException } from './useExceptions';
import { useAuth } from '@/contexts/AuthContext';
import { Habit } from '@/types/habit';
import { format, subDays } from 'date-fns';

const LAST_CHECK_KEY = 'habitquest_last_exception_check';

interface UseHabitExceptionTrackerProps {
  habits: Habit[];
  getStreak: () => number;
}

export function useHabitExceptionTracker({ habits, getStreak }: UseHabitExceptionTrackerProps) {
  const { user } = useAuth();
  const createException = useCreateException();

  const checkAndLogMissedHabits = useCallback(async () => {
    if (!user || habits.length === 0) return;

    const today = new Date();
    const yesterday = subDays(today, 1);
    const yesterdayDate = format(yesterday, 'yyyy-MM-dd');
    const yesterdayDay = yesterday.getDate();
    
    // Check if we already checked yesterday
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    if (lastCheck === yesterdayDate) return;

    // Find habits that were not completed yesterday
    const missedHabits = habits.filter(habit => !habit.completedDays.includes(yesterdayDay));
    
    if (missedHabits.length > 0) {
      // Calculate what percentage of habits were missed
      const missedPercentage = (missedHabits.length / habits.length) * 100;
      
      // Only log exception if streak was broken (not all habits completed)
      const allCompleted = habits.every(h => h.completedDays.includes(yesterdayDay));
      
      if (!allCompleted) {
        const missedHabitNames = missedHabits.map(h => `${h.emoji} ${h.name}`).join(', ');
        
        try {
          await createException.mutateAsync({
            exception_date: yesterdayDate,
            reason_category: 'other',
            reason_details: `Missed daily habits: ${missedHabitNames}`,
            reflection_note: `${missedHabits.length} of ${habits.length} habits were not completed (${missedPercentage.toFixed(0)}% missed). This broke your streak.`,
            mood: null,
            was_genuine: null,
            task_id: null,
            routine_id: null,
            schedule_entry_id: null,
          });
        } catch (error) {
          console.error('Failed to log habit exception:', error);
        }
      }
    }
    
    // Mark as checked
    localStorage.setItem(LAST_CHECK_KEY, yesterdayDate);
  }, [user, habits, createException]);

  // Check on mount and when habits change
  useEffect(() => {
    checkAndLogMissedHabits();
  }, [checkAndLogMissedHabits]);

  // Function to manually log an exception for today
  const logTodayException = useCallback(async (reason: string, mood?: 'happy' | 'neutral' | 'sad' | 'frustrated' | 'anxious') => {
    if (!user) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDay = new Date().getDate();
    const missedHabits = habits.filter(habit => !habit.completedDays.includes(todayDay));
    
    if (missedHabits.length > 0) {
      const missedHabitNames = missedHabits.map(h => `${h.emoji} ${h.name}`).join(', ');
      
      try {
        await createException.mutateAsync({
          exception_date: today,
          reason_category: 'other',
          reason_details: `${reason}. Missed habits: ${missedHabitNames}`,
          reflection_note: `${missedHabits.length} of ${habits.length} habits incomplete today.`,
          mood: mood || null,
          was_genuine: null,
          task_id: null,
          routine_id: null,
          schedule_entry_id: null,
        });
        return true;
      } catch (error) {
        console.error('Failed to log habit exception:', error);
        return false;
      }
    }
    return false;
  }, [user, habits, createException]);

  return {
    checkAndLogMissedHabits,
    logTodayException,
    isLogging: createException.isPending,
  };
}
