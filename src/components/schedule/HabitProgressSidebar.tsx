import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';
import { Routine } from '@/hooks/useRoutines';

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

  // Calculate overall stats
  const calculateOverallStats = () => {
    let totalScheduled = 0;
    let totalCompleted = 0;

    daysInMonth.forEach(day => {
      const dayOfWeek = day.getDay();
      routines.forEach(routine => {
        if (routine.days_of_week.includes(dayOfWeek)) {
          totalScheduled++;
          const dateString = format(day, 'yyyy-MM-dd');
          const entry = entries.find(e => 
            e.routine_id === routine.id && 
            e.entry_date === dateString && 
            e.is_completed
          );
          if (entry) {
            totalCompleted++;
          }
        }
      });
    });

    return {
      completed: totalCompleted,
      total: totalScheduled,
      percentage: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
      left: totalScheduled - totalCompleted
    };
  };

  // Get top habits by completion rate
  const getTopHabits = () => {
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
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => b.percentage - a.percentage).slice(0, 10);
  };

  const stats = calculateOverallStats();
  const topHabits = getTopHabits();

  const categoryEmojis: Record<string, string> = {
    lifestyle: '🌟',
    health: '💪',
    study: '📚',
    work: '💼',
    other: '✨'
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          Overall Progress
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.left}</div>
            <div className="text-xs text-muted-foreground">Left</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{stats.percentage}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Habits */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          Top 10 Daily Habits
        </h3>
        <div className="space-y-2">
          {topHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No habits tracked yet
            </p>
          ) : (
            topHabits.map((habit, index) => (
              <div 
                key={habit.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors"
              >
                <span className="text-sm font-medium text-muted-foreground w-5">
                  {index + 1}
                </span>
                <span className="text-sm">{categoryEmojis[habit.category]}</span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {habit.title}
                </span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {habit.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          {format(selectedMonth, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted/20 rounded-lg">
            <div className="text-lg font-bold text-foreground">{routines.length}</div>
            <div className="text-xs text-muted-foreground">Total Habits</div>
          </div>
          <div className="p-2 bg-muted/20 rounded-lg">
            <div className="text-lg font-bold text-foreground">{daysInMonth.length}</div>
            <div className="text-xs text-muted-foreground">Days Tracked</div>
          </div>
        </div>
      </div>
    </div>
  );
}
