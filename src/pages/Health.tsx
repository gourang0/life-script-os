import { useState } from 'react';
import { format } from 'date-fns';
import { Heart, Utensils, Dumbbell, Moon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useNutritionLogs, useExerciseLogs, useSleepLogs } from '@/hooks/useHealth';
import { DateSelector } from '@/components/schedule/DateSelector';
import { AddNutritionDialog } from '@/components/health/AddNutritionDialog';
import { AddExerciseDialog } from '@/components/health/AddExerciseDialog';
import { AddSleepDialog } from '@/components/health/AddSleepDialog';
import { NutritionCard } from '@/components/health/NutritionCard';
import { ExerciseCard } from '@/components/health/ExerciseCard';
import { SleepCard } from '@/components/health/SleepCard';
import { HealthSummary } from '@/components/health/HealthSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Health() {
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: nutritionLogs = [], isLoading: loadingNutrition } = useNutritionLogs(dateString);
  const { data: exerciseLogs = [], isLoading: loadingExercise } = useExerciseLogs(dateString);
  const { data: sleepLogs = [], isLoading: loadingSleep } = useSleepLogs(dateString);

  const isLoading = loadingNutrition || loadingExercise || loadingSleep;

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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            Health Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your nutrition, exercise, and sleep
          </p>
        </div>

        {/* Date Selector */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Summary */}
        <HealthSummary nutritionLogs={nutritionLogs} exerciseLogs={exerciseLogs} />

        {/* Tabs */}
        <Tabs defaultValue="nutrition" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="nutrition" className="gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="exercise" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Exercise</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="gap-2">
              <Moon className="w-4 h-4" />
              <span className="hidden sm:inline">Sleep</span>
            </TabsTrigger>
          </TabsList>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Meals</h3>
              <AddNutritionDialog selectedDate={dateString} />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : nutritionLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
                <Utensils className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <h4 className="font-medium text-foreground mb-1">No meals logged</h4>
                <p className="text-sm text-muted-foreground">Start tracking your nutrition</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {nutritionLogs.map((log) => (
                  <NutritionCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exercise Tab */}
          <TabsContent value="exercise" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Workouts</h3>
              <AddExerciseDialog selectedDate={dateString} />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : exerciseLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
                <Dumbbell className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <h4 className="font-medium text-foreground mb-1">No exercise logged</h4>
                <p className="text-sm text-muted-foreground">Start tracking your workouts</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {exerciseLogs.map((log) => (
                  <ExerciseCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Sleep Log</h3>
              <AddSleepDialog selectedDate={dateString} />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : sleepLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
                <Moon className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <h4 className="font-medium text-foreground mb-1">No sleep logged</h4>
                <p className="text-sm text-muted-foreground">Start tracking your sleep</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {sleepLogs.map((log) => (
                  <SleepCard key={log.id} log={log} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
