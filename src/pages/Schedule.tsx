import { useState } from 'react';
import { useHabitTracker } from '@/hooks/useHabitTracker';
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
  const [showPanels, setShowPanels] = useState(true);
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
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
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
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPanels(!showPanels)}
                className="flex items-center gap-2"
              >
                {showPanels ? (
                  <>
                    <PanelLeftClose className="w-4 h-4" />
                    <span className="hidden sm:inline">Hide Panels</span>
                  </>
                ) : (
                  <>
                    <PanelLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Show Panels</span>
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
        </header>

        {/* Main Content */}
        <div className={`grid gap-6 ${showPanels ? 'lg:grid-cols-[280px_1fr_280px]' : ''}`}>
          {/* Left Panel */}
          {showPanels && (
            <aside className="space-y-6">
              <LevelProgress progress={progress} />
              <StreakCounter streak={getStreak()} />
              <OverallProgress 
                completed={getTotalCompleted()} 
                goal={getTotalGoal()} 
                percentage={getOverallProgress()} 
              />
            </aside>
          )}

          {/* Main Habit Grid */}
          <main className="space-y-6">
            <HabitGrid 
              habits={habits}
              daysInMonth={getDaysInMonth()}
              onToggle={toggleHabit}
              onDelete={removeHabit}
            />
            
            {/* Weekly Chart */}
            <WeeklyChart data={getWeeklyData()} />
          </main>

          {/* Right Panel */}
          {showPanels && (
            <aside>
              <TopHabits habits={habits} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
