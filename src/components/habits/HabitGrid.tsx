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
      
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse" style={{ minWidth: `${300 + weeks * 180}px` }}>
          <thead>
            {/* Week headers row */}
            <tr className="bg-primary/20">
              <th className="border border-border p-3 text-left font-semibold text-sm text-foreground w-[200px] min-w-[200px]">
                DAILY HABITS
              </th>
              <th className="border border-border p-3 text-center font-semibold text-sm text-foreground w-[80px] min-w-[80px]">
                GOAL
              </th>
              {Array.from({ length: weeks }, (_, i) => (
                <th key={i} className="border border-border p-0 text-center font-semibold text-sm text-foreground" style={{ minWidth: '180px' }}>
                  <div className="p-2 border-b border-border">WEEK {i + 1}</div>
                  <div className="grid grid-cols-7">
                    {dayNames.map((name, j) => (
                      <div key={j} className="py-1 px-1 border-r border-border last:border-r-0">
                        <span className="text-xs text-muted-foreground block">{name}</span>
                        <span className="text-xs text-foreground font-medium">
                          {i * 7 + j + 1 <= daysInMonth ? i * 7 + j + 1 : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="group hover:bg-muted/30 transition-colors">
                <td className="border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl flex-shrink-0">{habit.emoji}</span>
                    <span className="text-sm font-medium text-foreground truncate">{habit.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(habit.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="border border-border p-3 text-center text-sm font-semibold text-muted-foreground">
                  {habit.goal}
                </td>
                {Array.from({ length: weeks }, (_, weekIndex) => (
                  <td key={weekIndex} className="border border-border p-0">
                    <div className="grid grid-cols-7">
                      {getWeekDays(weekIndex).map((day) => {
                        const isCompleted = habit.completedDays.includes(day);
                        const isFuture = isFutureDate(day);
                        return (
                          <div 
                            key={day} 
                            className={cn(
                              "flex items-center justify-center p-2 border-r border-border last:border-r-0 min-h-[44px]",
                              isFuture && "bg-muted/50"
                            )}
                          >
                            {isFuture ? (
                              <Lock className="w-4 h-4 text-muted-foreground/50" />
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
                          <div key={`empty-${i}`} className="border-r border-border last:border-r-0 min-h-[44px]" />
                        ))
                      }
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
