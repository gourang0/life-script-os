import { useState, useEffect, useCallback } from 'react';
import { Habit, UserProgress, DEFAULT_HABITS, XP_PER_HABIT, BASE_XP_TO_LEVEL } from '@/types/habit';

const STORAGE_KEY = 'habitquest_data';

interface StoredData {
  habits: Habit[];
  progress: UserProgress;
  currentMonth: string;
}

const getInitialProgress = (): UserProgress => ({
  level: 1,
  xp: 0,
  xpToNextLevel: BASE_XP_TO_LEVEL,
  streak: 0,
});

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useHabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress());
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredData = JSON.parse(stored);
      if (data.currentMonth === getCurrentMonth()) {
        setHabits(data.habits);
        setProgress(data.progress);
      } else {
        // New month - reset habits but keep level/xp
        setHabits(DEFAULT_HABITS);
        setProgress(prev => ({ ...data.progress, streak: 0 }));
      }
      setCurrentMonth(data.currentMonth);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data: StoredData = { habits, progress, currentMonth };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [habits, progress, currentMonth]);

  const toggleHabit = useCallback((habitId: string, day: number) => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === habitId);
      if (!habit) return prev;

      const isCompleted = habit.completedDays.includes(day);
      
      // Update XP
      if (!isCompleted) {
        setProgress(p => {
          let newXp = p.xp + XP_PER_HABIT;
          let newLevel = p.level;
          let xpNeeded = p.xpToNextLevel;
          
          while (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel++;
            xpNeeded = BASE_XP_TO_LEVEL * newLevel;
          }
          
          return { ...p, xp: newXp, level: newLevel, xpToNextLevel: xpNeeded };
        });
      } else {
        setProgress(p => {
          const newXp = Math.max(0, p.xp - XP_PER_HABIT);
          return { ...p, xp: newXp };
        });
      }

      return prev.map(h => 
        h.id === habitId
          ? {
              ...h,
              completedDays: isCompleted
                ? h.completedDays.filter(d => d !== day)
                : [...h.completedDays, day]
            }
          : h
      );
    });
  }, []);

  const addHabit = useCallback((name: string, emoji: string, goal: number) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      goal,
      completedDays: [],
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  }, []);

  const getDaysInMonth = useCallback(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [currentMonth]);

  const getWeeksInMonth = useCallback(() => {
    const days = getDaysInMonth();
    return Math.ceil(days / 7);
  }, [getDaysInMonth]);

  const getTotalCompleted = useCallback(() => {
    return habits.reduce((acc, h) => acc + h.completedDays.length, 0);
  }, [habits]);

  const getTotalGoal = useCallback(() => {
    return habits.reduce((acc, h) => acc + h.goal, 0);
  }, [habits]);

  const getOverallProgress = useCallback(() => {
    const total = getTotalGoal();
    const completed = getTotalCompleted();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [getTotalCompleted, getTotalGoal]);

  // Calculate streak - consecutive days where ALL habits are completed
  const getStreak = useCallback(() => {
    const today = new Date().getDate();
    let streak = 0;
    
    for (let day = today; day >= 1; day--) {
      const allCompleted = habits.every(h => h.completedDays.includes(day));
      if (allCompleted && habits.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [habits]);

  // Get weekly completion data for chart
  const getWeeklyData = useCallback(() => {
    const weeks = getWeeksInMonth();
    const daysInMonth = getDaysInMonth();
    const data = [];

    for (let w = 0; w < weeks; w++) {
      const startDay = w * 7 + 1;
      const endDay = Math.min((w + 1) * 7, daysInMonth);
      const daysInWeek = endDay - startDay + 1;
      
      let completedCount = 0;
      let totalPossible = habits.length * daysInWeek;

      habits.forEach(habit => {
        for (let d = startDay; d <= endDay; d++) {
          if (habit.completedDays.includes(d)) {
            completedCount++;
          }
        }
      });

      const percentage = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
      data.push({
        week: `Week ${w + 1}`,
        completed: completedCount,
        total: totalPossible,
        percentage,
      });
    }

    return data;
  }, [habits, getWeeksInMonth, getDaysInMonth]);

  return {
    habits,
    progress,
    currentMonth,
    toggleHabit,
    addHabit,
    removeHabit,
    getDaysInMonth,
    getWeeksInMonth,
    getTotalCompleted,
    getTotalGoal,
    getOverallProgress,
    getStreak,
    getWeeklyData,
  };
};
