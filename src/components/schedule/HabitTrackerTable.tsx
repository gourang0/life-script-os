import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval, addWeeks } from 'date-fns';
import { Check, Target } from 'lucide-react';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';
import { Routine } from '@/hooks/useRoutines';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HabitTrackerTableProps {
  routines: Routine[];
  entries: ScheduleEntry[];
  selectedMonth: Date;
  onComplete: (id: string) => void;
}

export function HabitTrackerTable({ routines, entries, selectedMonth, onComplete }: HabitTrackerTableProps) {
  // Get weeks for the selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
  
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10 hover:bg-primary/10">
            <TableHead className="sticky left-0 bg-primary/10 min-w-[180px] font-bold text-foreground">
              Daily Habits
            </TableHead>
            <TableHead className="text-center font-bold text-foreground w-16">Goal</TableHead>
            {weeks.slice(0, 5).map((weekStart, weekIndex) => (
              <TableHead 
                key={weekIndex} 
                colSpan={7} 
                className="text-center border-l border-border font-bold text-foreground"
              >
                Week {weekIndex + 1}
              </TableHead>
            ))}
            <TableHead className="text-center border-l border-border font-bold text-foreground w-20">
              Progress
            </TableHead>
          </TableRow>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="sticky left-0 bg-muted/30"></TableHead>
            <TableHead></TableHead>
            {weeks.slice(0, 5).map((weekStart, weekIndex) => (
              dayLabels.map((label, dayIndex) => {
                const day = addDays(weekStart, dayIndex);
                const dayNum = format(day, 'd');
                const isInMonth = day >= monthStart && day <= monthEnd;
                return (
                  <TableHead 
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "text-center p-1 w-8 text-xs font-medium",
                      dayIndex === 0 && "border-l border-border",
                      !isInMonth && "text-muted-foreground/40"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={isInMonth ? "text-foreground" : "text-muted-foreground/40"}>{dayNum}</span>
                    </div>
                  </TableHead>
                );
              })
            ))}
            <TableHead className="border-l border-border"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2 + (5 * 7) + 1} className="text-center py-12 text-muted-foreground">
                No habits set up yet. Create routines to track them here!
              </TableCell>
            </TableRow>
          ) : (
            routines.map((routine, index) => {
              const stats = getCompletionStats(routine);
              const categoryEmojis: Record<string, string> = {
                lifestyle: '🌟',
                health: '💪',
                study: '📚',
                work: '💼',
                other: '✨'
              };
              const emoji = categoryEmojis[routine.category] || '✨';

              return (
                <TableRow 
                  key={routine.id} 
                  className={cn(
                    "hover:bg-muted/20",
                    index % 2 === 0 ? "bg-card" : "bg-background"
                  )}
                >
                  <TableCell className="sticky left-0 font-medium bg-inherit">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="truncate max-w-[140px]">{routine.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <span className="bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded text-sm">
                        {routine.days_of_week.length}
                      </span>
                    </div>
                  </TableCell>
                  {weeks.slice(0, 5).map((weekStart, weekIndex) => (
                    dayLabels.map((_, dayIndex) => {
                      const day = addDays(weekStart, dayIndex);
                      const isInMonth = day >= monthStart && day <= monthEnd;
                      const isScheduled = isRoutineScheduledForDay(routine, dayIndex);
                      const entry = getEntryForRoutineAndDate(routine.id, day);
                      const isCompleted = entry?.is_completed;
                      const isFuture = day > new Date();
                      const isPast = day < new Date() && !isSameDay(day, new Date());

                      return (
                        <TableCell 
                          key={`${routine.id}-${weekIndex}-${dayIndex}`}
                          className={cn(
                            "text-center p-1 w-8",
                            dayIndex === 0 && "border-l border-border"
                          )}
                        >
                          {isInMonth && isScheduled ? (
                            <button
                              onClick={() => entry && !isCompleted && onComplete(entry.id)}
                              disabled={!entry || isFuture}
                              className={cn(
                                "w-6 h-6 rounded flex items-center justify-center mx-auto transition-all",
                                isCompleted 
                                  ? "bg-primary text-primary-foreground" 
                                  : isPast && entry
                                    ? "bg-destructive/20 border border-destructive/40"
                                    : isFuture
                                      ? "bg-muted/30 border border-border"
                                      : entry
                                        ? "bg-muted/50 border border-border hover:border-primary hover:bg-primary/10 cursor-pointer"
                                        : "bg-muted/30 border border-border"
                              )}
                            >
                              {isCompleted && <Check className="w-4 h-4" />}
                            </button>
                          ) : (
                            <div className="w-6 h-6 mx-auto" />
                          )}
                        </TableCell>
                      );
                    })
                  ))}
                  <TableCell className="text-center border-l border-border">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-10">
                        {stats.percentage}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
