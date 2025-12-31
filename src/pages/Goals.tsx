import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { DailyTracker } from '@/components/goals/DailyTracker';
import { GoalTargets } from '@/components/goals/GoalTargets';
import { StreakFreezeDialog } from '@/components/streak/StreakFreezeDialog';
import { DateSelector } from '@/components/schedule/DateSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Loader2 } from 'lucide-react';

export default function Goals() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: goals = [], isLoading } = useGoals();

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Goals</h1>
              <p className="text-sm text-muted-foreground">Track your daily progress and long-term goals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StreakFreezeDialog />
            <CreateGoalDialog />
          </div>
        </div>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily Tracking</TabsTrigger>
            <TabsTrigger value="goals">Long-term Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailyTracker selectedDate={selectedDate} />
              <GoalTargets selectedDate={selectedDate} />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="mb-2">No goals set yet</p>
                <p className="text-sm">Create your first goal to start tracking progress</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeGoals.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Active Goals ({activeGoals.length})</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {activeGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                      ))}
                    </div>
                  </div>
                )}

                {completedGoals.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground">
                      Completed ({completedGoals.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {completedGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
