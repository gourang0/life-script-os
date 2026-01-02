import { Habit } from '@/types/habit';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash2, Lock } from 'lucide-react';

interface HabitGridProps {
  habits: Habit[];
  daysInMonth: number;
  onToggle: (habitId: string, day: number) => void;
  onDelete: (habitId: string) => void;
}

export const HabitGrid = ({ habits, daysInMonth, onToggle, onDelete }: HabitGridProps) => {
  const weeks = Math.ceil(daysInMonth / 7);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isFutureDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(currentYear, currentMonth, currentDay);
    return checkDate > todayDate;
  };

  const getWeekDays = (weekIndex: number) => {
    const start = weekIndex * 7;
    return days.slice(start, start + 7);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md border border-border">
      <h3 className="font-semibold text-xl mb-6 text-foreground">Daily Habits</h3>
      
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with weeks */}
          <div className="grid gap-0 border border-border" style={{ gridTemplateColumns: `200px 60px 44px repeat(${weeks}, 1fr)` }}>
            {/* Header Row */}
            <div className="bg-primary/20 p-3 border-r border-border font-semibold text-sm text-foreground">
              DAILY HABITS
            </div>
            <div className="bg-primary/20 p-3 border-r border-border font-semibold text-sm text-foreground text-center">
              GOAL
            </div>
            <div className="bg-primary/20 p-3 border-r border-border"></div>
            {Array.from({ length: weeks }, (_, i) => (
              <div key={i} className="bg-primary/20 border-r border-border last:border-r-0 min-w-0">
                <div className="text-center font-semibold text-sm text-foreground p-2 border-b border-border">
                  WEEK {i + 1}
                </div>
                <div className="grid grid-cols-7">
                  {dayNames.map((name, j) => (
                    <div key={j} className="text-center border-r border-border last:border-r-0 py-1 px-0.5">
                      <span className="text-xs text-muted-foreground block">{name}</span>
                      <span className="text-xs text-foreground font-medium">
                        {i * 7 + j + 1 <= daysInMonth ? i * 7 + j + 1 : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Habit rows */}
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="grid gap-0 border-x border-b border-border group hover:bg-muted/30 transition-colors"
              style={{ gridTemplateColumns: `200px 60px 44px repeat(${weeks}, 1fr)` }}
            >
              <div className="flex items-center gap-2 p-3 border-r border-border min-w-0">
                <span className="text-xl flex-shrink-0">{habit.emoji}</span>
                <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
              </div>
              <div className="flex items-center justify-center border-r border-border text-sm font-semibold text-muted-foreground">
                {habit.goal}
              </div>
              <div className="flex items-center justify-center border-r border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(habit.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              {Array.from({ length: weeks }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 border-r border-border last:border-r-0">
                  {getWeekDays(weekIndex).map((day) => {
                    const isCompleted = habit.completedDays.includes(day);
                    const isFuture = isFutureDate(day);
                    return (
                      <div 
                        key={day} 
                        className={cn(
                          "flex items-center justify-center p-1.5 border-r border-border last:border-r-0 min-h-[40px]",
                          isFuture && "bg-muted/50"
                        )}
                      >
                        {isFuture ? (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                        ) : (
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => onToggle(habit.id, day)}
                            className={cn(
                              "w-5 h-5 rounded-sm border-2 transition-all",
                              isCompleted 
                                ? "bg-primary border-primary data-[state=checked]:bg-primary" 
                                : "border-muted-foreground/40 bg-background"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                  {/* Fill empty days */}
                  {weekIndex === weeks - 1 && 
                    Array.from({ length: 7 - getWeekDays(weekIndex).length }, (_, i) => (
                      <div key={`empty-${i}`} className="border-r border-border last:border-r-0 min-h-[40px]" />
                    ))
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
