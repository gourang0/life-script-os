import { Habit } from '@/types/habit';
import { Medal } from 'lucide-react';

interface TopHabitsProps {
  habits: Habit[];
}

export const TopHabits = ({ habits }: TopHabitsProps) => {
  const sortedHabits = [...habits]
    .sort((a, b) => b.completedDays.length - a.completedDays.length)
    .slice(0, 5);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-primary';
      case 1: return 'text-muted-foreground';
      case 2: return 'text-accent-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
        <Medal className="w-5 h-5 text-primary" />
        Top Habits
      </h3>
      
      <div className="space-y-3">
        {sortedHabits.map((habit, index) => (
          <div key={habit.id} className="flex items-center gap-3">
            <span className={`font-bold text-lg w-6 ${getMedalColor(index)}`}>
              {index + 1}
            </span>
            <span className="text-lg">{habit.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{habit.name}</p>
              <p className="text-xs text-muted-foreground">
                {habit.completedDays.length} / {habit.goal} completed
              </p>
            </div>
            <span className="text-sm font-semibold text-primary">
              {habit.goal > 0 ? Math.round((habit.completedDays.length / habit.goal) * 100) : 0}%
            </span>
          </div>
        ))}
        
        {sortedHabits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start completing habits to see your top performers!
          </p>
        )}
      </div>
    </div>
  );
};
