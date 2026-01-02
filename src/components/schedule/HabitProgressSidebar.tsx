import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Trophy } from 'lucide-react';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';
import { Routine } from '@/hooks/useRoutines';
import { cn } from '@/lib/utils';

interface HabitProgressSidebarProps {
  routines: Routine[];
  entries: ScheduleEntry[];
  selectedMonth: Date;
}

export function HabitProgressSidebar({ routines, entries, selectedMonth }: HabitProgressSidebarProps) {
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const today = new Date();
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd > today ? today : monthEnd });

  // Get habits with completion stats
  const getHabitsWithStats = () => {
    return routines.map(routine => {
      let completed = 0;
      let total = 0;

      daysInMonth.forEach(day => {
        const dayOfWeek = day.getDay();
        if (routine.days_of_week.includes(dayOfWeek)) {
          total++;
          const dateString = format(day, 'yyyy-MM-dd');
          const entry = entries.find(e => 
            e.routine_id === routine.id && 
            e.entry_date === dateString && 
            e.is_completed
          );
          if (entry) {
            completed++;
          }
        }
      });

      return {
        ...routine,
        completed,
        total,
        left: total - completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const habitsWithStats = getHabitsWithStats();

  const categoryEmojis: Record<string, string> = {
    lifestyle: '🌟',
    health: '💪',
    study: '📚',
    work: '💼',
    other: '✨'
  };

  return (
    <div className="space-y-4">
      {/* Top 10 Daily Habits */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-primary/10 p-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            TOP 10 DAILY HABITS
          </h3>
        </div>
        <div className="p-2">
          {habitsWithStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No habits tracked yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {habitsWithStats.slice(0, 10).map((habit, index) => (
                  <tr key={habit.id} className="hover:bg-muted/20">
                    <td className="p-1.5 w-6 text-muted-foreground font-medium">{index + 1}</td>
                    <td className="p-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{categoryEmojis[habit.category]}</span>
                        <span className="truncate max-w-[120px] text-foreground">{habit.title}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overall Progress Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-primary/10 p-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-center">OVERALL PROGRESS</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30">
              <th className="p-2 text-left text-muted-foreground font-medium">#</th>
              <th className="p-2 text-center text-muted-foreground font-medium">COMP</th>
              <th className="p-2 text-center text-muted-foreground font-medium">LEFT</th>
              <th className="p-2 text-right text-muted-foreground font-medium">%</th>
              <th className="p-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {habitsWithStats.map((habit, index) => (
              <tr key={habit.id} className={cn(
                "hover:bg-muted/20",
                index % 2 === 0 ? "bg-card" : "bg-background"
              )}>
                <td className="p-2 text-muted-foreground">{index + 1}</td>
                <td className="p-2 text-center font-medium text-foreground">{habit.completed}</td>
                <td className="p-2 text-center font-medium text-foreground">{habit.left}</td>
                <td className="p-2 text-right font-semibold text-foreground">{habit.percentage}%</td>
                <td className="p-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        habit.percentage >= 80 ? "bg-green-500" :
                        habit.percentage >= 50 ? "bg-primary" :
                        "bg-muted-foreground/30"
                      )}
                      style={{ width: `${habit.percentage}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}