export interface Habit {
  id: string;
  name: string;
  emoji: string;
  goal: number;
  completedDays: number[];
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
}

export const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Wake up at 6AM', emoji: '☀️', goal: 30, completedDays: [] },
  { id: '2', name: 'No Snoozing', emoji: '⏰', goal: 30, completedDays: [] },
  { id: '3', name: 'Drink 3L Water', emoji: '💧', goal: 30, completedDays: [] },
  { id: '4', name: 'Gym Workout', emoji: '💪', goal: 20, completedDays: [] },
  { id: '5', name: 'Stretching', emoji: '🧘', goal: 20, completedDays: [] },
  { id: '6', name: 'Read 10 Pages', emoji: '📚', goal: 30, completedDays: [] },
  { id: '7', name: 'Meditation', emoji: '🧠', goal: 30, completedDays: [] },
  { id: '8', name: 'Study 1 Hour', emoji: '📖', goal: 20, completedDays: [] },
  { id: '9', name: 'Skincare Routine', emoji: '✨', goal: 30, completedDays: [] },
  { id: '10', name: 'Limit Social Media', emoji: '📵', goal: 30, completedDays: [] },
  { id: '11', name: 'No Alcohol', emoji: '🚫', goal: 30, completedDays: [] },
  { id: '12', name: 'Track Expenses', emoji: '💰', goal: 30, completedDays: [] },
];

export const XP_PER_HABIT = 10;
export const BASE_XP_TO_LEVEL = 100;
