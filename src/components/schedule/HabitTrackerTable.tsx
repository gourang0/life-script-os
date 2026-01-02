import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { Check } from 'lucide-react';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';
import { Routine } from '@/hooks/useRoutines';
import { cn } from '@/lib/utils';

interface HabitTrackerTableProps {
  routines: Routine[];
  entries: ScheduleEntry[];
  selectedMonth: Date;
  onComplete: (id: string) => void;
}

export function HabitTrackerTable({ routines, entries, selectedMonth, onComplete }: HabitTrackerTableProps) {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
  
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEntryForRoutineAndDate = (routineId: string, date: Date): ScheduleEntry | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return entries.find(entry => 
      entry.routine_id === routineId && 
      entry.entry_date === dateString
    );
  };

  const isRoutineScheduledForDay = (routine: Routine, dayOfWeek: number): boolean => {
    return routine.days_of_week.includes(dayOfWeek);
  };

  const getCompletionStats = (routine: Routine): { completed: number; total: number; percentage: number } => {
    let completed = 0;
    let total = 0;

    weeks.forEach(weekStart => {
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        if (day >= monthStart && day <= monthEnd && day <= new Date()) {
          if (isRoutineScheduledForDay(routine, i)) {
            total++;
            const entry = getEntryForRoutineAndDate(routine.id, day);
            if (entry?.is_completed) {
              completed++;
            }
          }
        }
      }
    });

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const categoryEmojis: Record<string, string> = {
    lifestyle: '🌟',
    health: '💪',
    study: '📚',
    work: '💼',
    other: '✨'
  };

  // Calculate weekly progress
  const getWeeklyStats = (weekIndex: number) => {
    const weekStart = weeks[weekIndex];
    if (!weekStart) return { completed: 0, goal: 0, left: 0, percentage: 0 };
    
    let completed = 0;
    let goal = 0;

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      if (day >= monthStart && day <= monthEnd && day <= new Date()) {
        routines.forEach(routine => {
          if (isRoutineScheduledForDay(routine, i)) {
            goal++;
            const entry = getEntryForRoutineAndDate(routine.id, day);
            if (entry?.is_completed) {
              completed++;
            }
          }
        });
      }
    }

    return {
      completed,
      goal,
      left: goal - completed,
      percentage: goal > 0 ? Math.round((completed / goal) * 100) : 0
    };
  };

  return (
    <div className="overflow-x-auto">
      {/* Overview Section */}
      <div className="mb-6 border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-3 text-left font-semibold text-foreground w-40 border-r border-border">OVERVIEW</th>
              {weeks.slice(0, 5).map((_, weekIndex) => (
                <th key={weekIndex} colSpan={7} className="p-2 text-center font-semibold text-foreground border-r border-border last:border-r-0">
                  <div>WEEK {weekIndex + 1}</div>
                  <div className="flex justify-center gap-0.5 text-xs font-normal text-muted-foreground mt-1">
                    {dayLabels.map((label, i) => {
                      const day = addDays(weeks[weekIndex], i);
                      const dayNum = format(day, 'd');
                      const isInMonth = day >= monthStart && day <= monthEnd;
                      return (
                        <span key={i} className={cn("w-6 text-center", !isInMonth && "opacity-40")}>
                          {label.charAt(0)}<br/>{isInMonth ? dayNum : '-'}
                        </span>
                      );
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-card">
              <td className="p-3 font-medium text-foreground border-r border-border">GLOBAL PROGRESS</td>
              {weeks.slice(0, 5).map((weekStart, weekIndex) => {
                const stats = getWeeklyStats(weekIndex);
                return (
                  <td key={weekIndex} colSpan={7} className="p-2 border-r border-border last:border-r-0">
                    <div className="flex justify-center items-end h-16 gap-0.5">
                      {dayLabels.map((_, dayIndex) => {
                        const day = addDays(weekStart, dayIndex);
                        const isInMonth = day >= monthStart && day <= monthEnd;
                        if (!isInMonth || day > new Date()) return <div key={dayIndex} className="w-5 h-0" />;
                        
                        let dayCompleted = 0;
                        let dayTotal = 0;
                        routines.forEach(routine => {
                          if (isRoutineScheduledForDay(routine, dayIndex)) {
                            dayTotal++;
                            const entry = getEntryForRoutineAndDate(routine.id, day);
                            if (entry?.is_completed) dayCompleted++;
                          }
                        });
                        const height = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0;
                        return (
                          <div key={dayIndex} className="w-5 bg-muted rounded-sm overflow-hidden h-full flex flex-col justify-end">
                            <div 
                              className="bg-primary transition-all rounded-sm"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr className="bg-muted/20 text-xs">
              <td className="p-2 text-muted-foreground border-r border-border pl-6">COMPLETED</td>
              {weeks.slice(0, 5).map((weekStart, weekIndex) => (
                <td key={weekIndex} colSpan={7} className="p-1 text-center border-r border-border last:border-r-0">
                  <div className="flex justify-center gap-0.5">
                    {dayLabels.map((_, dayIndex) => {
                      const day = addDays(weekStart, dayIndex);
                      const isInMonth = day >= monthStart && day <= monthEnd;
                      if (!isInMonth || day > new Date()) return <span key={dayIndex} className="w-6 text-muted-foreground/40">-</span>;
                      
                      let completed = 0;
                      routines.forEach(routine => {
                        if (isRoutineScheduledForDay(routine, dayIndex)) {
                          const entry = getEntryForRoutineAndDate(routine.id, day);
                          if (entry?.is_completed) completed++;
                        }
                      });
                      return <span key={dayIndex} className="w-6 font-medium text-foreground">{completed}</span>;
                    })}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-muted/20 text-xs">
              <td className="p-2 text-muted-foreground border-r border-border pl-6">GOAL</td>
              {weeks.slice(0, 5).map((weekStart, weekIndex) => (
                <td key={weekIndex} colSpan={7} className="p-1 text-center border-r border-border last:border-r-0">
                  <div className="flex justify-center gap-0.5">
                    {dayLabels.map((_, dayIndex) => {
                      const day = addDays(weekStart, dayIndex);
                      const isInMonth = day >= monthStart && day <= monthEnd;
                      if (!isInMonth) return <span key={dayIndex} className="w-6 text-muted-foreground/40">-</span>;
                      
                      let total = 0;
                      routines.forEach(routine => {
                        if (isRoutineScheduledForDay(routine, dayIndex)) total++;
                      });
                      return <span key={dayIndex} className="w-6 font-medium text-foreground">{total}</span>;
                    })}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="bg-muted/20 text-xs">
              <td className="p-2 text-muted-foreground border-r border-border pl-6">WEEKLY PROGRESS</td>
              {weeks.slice(0, 5).map((_, weekIndex) => {
                const stats = getWeeklyStats(weekIndex);
                return (
                  <td key={weekIndex} colSpan={7} className="p-1 text-center border-r border-border last:border-r-0">
                    <span className="font-semibold text-primary">{stats.percentage}%</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Daily Habits Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-3 text-left font-semibold text-foreground w-44 border-r border-border">DAILY HABITS</th>
              <th className="p-2 text-center font-semibold text-foreground w-14 border-r border-border">GOALS</th>
              {weeks.slice(0, 5).map((weekStart, weekIndex) => (
                <th key={weekIndex} colSpan={7} className="p-2 text-center font-semibold text-foreground border-r border-border last:border-r-0">
                  <div>WEEK {weekIndex + 1}</div>
                  <div className="flex justify-center text-xs font-normal text-muted-foreground mt-1">
                    {dayLabels.map((label, i) => {
                      const day = addDays(weeks[weekIndex], i);
                      const dayNum = format(day, 'd');
                      const isInMonth = day >= monthStart && day <= monthEnd;
                      return (
                        <div key={i} className={cn("w-7 text-center", !isInMonth && "opacity-40")}>
                          <div>{label.charAt(0)}</div>
                          <div>{isInMonth ? dayNum : '-'}</div>
                        </div>
                      );
                    })}
                  </div>
                </th>
              ))}
              <th className="p-2 text-center font-semibold text-foreground w-16 border-l border-border">%</th>
            </tr>
          </thead>
          <tbody>
            {routines.length === 0 ? (
              <tr>
                <td colSpan={100} className="text-center py-12 text-muted-foreground">
                  No habits set up yet. Create routines to track them here!
                </td>
              </tr>
            ) : (
              routines.map((routine, index) => {
                const stats = getCompletionStats(routine);
                const emoji = categoryEmojis[routine.category] || '✨';

                return (
                  <tr 
                    key={routine.id} 
                    className={cn(
                      "hover:bg-muted/20 transition-colors",
                      index % 2 === 0 ? "bg-card" : "bg-background"
                    )}
                  >
                    <td className="p-2 font-medium border-r border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <span className="truncate max-w-[160px] text-foreground">{routine.title}</span>
                      </div>
                    </td>
                    <td className="p-2 text-center border-r border-border">
                      <span className="font-semibold text-foreground">{routine.days_of_week.length * 4}</span>
                    </td>
                    {weeks.slice(0, 5).map((weekStart, weekIndex) => (
                      dayLabels.map((_, dayIndex) => {
                        const day = addDays(weekStart, dayIndex);
                        const isInMonth = day >= monthStart && day <= monthEnd;
                        const isScheduled = isRoutineScheduledForDay(routine, dayIndex);
                        const entry = getEntryForRoutineAndDate(routine.id, day);
                        const isCompleted = entry?.is_completed;
                        const isFuture = day > new Date();
                        const isToday = isSameDay(day, new Date());

                        return (
                          <td 
                            key={`${routine.id}-${weekIndex}-${dayIndex}`}
                            className={cn(
                              "p-0.5",
                              dayIndex === 0 && weekIndex > 0 && "border-l border-border"
                            )}
                          >
                            {isInMonth && isScheduled ? (
                              <button
                                onClick={() => entry && !isCompleted && onComplete(entry.id)}
                                disabled={!entry || isFuture}
                                className={cn(
                                  "w-6 h-6 border-2 rounded flex items-center justify-center mx-auto transition-all",
                                  isCompleted 
                                    ? "bg-primary/20 border-primary text-primary" 
                                    : isToday && entry
                                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                                      : isFuture
                                        ? "border-border bg-muted/20"
                                        : entry
                                          ? "border-muted-foreground/30 bg-background hover:border-primary hover:bg-primary/5 cursor-pointer"
                                          : "border-border bg-muted/20"
                                )}
                              >
                                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            ) : isInMonth ? (
                              <div className="w-6 h-6 border-2 border-transparent rounded mx-auto" />
                            ) : null}
                          </td>
                        );
                      })
                    ))}
                    <td className="p-2 text-center border-l border-border">
                      <span className={cn(
                        "font-semibold",
                        stats.percentage >= 80 ? "text-green-600 dark:text-green-400" :
                        stats.percentage >= 50 ? "text-primary" :
                        "text-muted-foreground"
                      )}>
                        {stats.percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}