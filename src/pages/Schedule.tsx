import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useHabitTracker } from '@/hooks/useHabitTracker';
import { useHabitExceptionTracker } from '@/hooks/useHabitExceptionTracker';
import { LevelProgress } from '@/components/habits/LevelProgress';
import { OverallProgress } from '@/components/habits/OverallProgress';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { TopHabits } from '@/components/habits/TopHabits';
import { AddHabitDialog } from '@/components/habits/AddHabitDialog';
import { WeeklyChart } from '@/components/habits/WeeklyChart';
import { StreakCounter } from '@/components/habits/StreakCounter';
import { Gamepad2, Calendar, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Schedule() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    habits,
    progress,
    currentMonth,
    toggleHabit,
    addHabit,
    removeHabit,
    getDaysInMonth,
    getTotalCompleted,
    getTotalGoal,
    getOverallProgress,
    getStreak,
    getWeeklyData,
  } = useHabitTracker();

  // Track missed habits and auto-log exceptions for streak breaks
  useHabitExceptionTracker({ habits, getStreak });

  const monthName = new Date(currentMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-xl p-3">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Habit Quest</h1>
              <p className="text-muted-foreground">Level up your daily routine!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-2"
            >
              {sidebarCollapsed ? (
                <>
                  <PanelLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Show Menu</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide Menu</span>
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{monthName}</span>
            </div>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LevelProgress progress={progress} />
          <StreakCounter streak={getStreak()} />
          <OverallProgress 
            completed={getTotalCompleted()} 
            goal={getTotalGoal()} 
            percentage={getOverallProgress()} 
          />
          <TopHabits habits={habits} />
        </div>

        {/* Main Habit Grid */}
        <HabitGrid 
          habits={habits}
          daysInMonth={getDaysInMonth()}
          onToggle={toggleHabit}
          onDelete={removeHabit}
        />
        
        {/* Weekly Chart */}
        <WeeklyChart data={getWeeklyData()} />
      </div>
    </AppLayout>
  );
}
