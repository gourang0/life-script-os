import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar, LayoutGrid } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useScheduleEntries, useCompleteScheduleEntry, useDeleteScheduleEntry } from '@/hooks/useScheduleEntries';
import { useMonthlyScheduleEntries } from '@/hooks/useMonthlyScheduleEntries';
import { useRoutines } from '@/hooks/useRoutines';
import { DateSelector } from '@/components/schedule/DateSelector';
import { TimeGrid } from '@/components/schedule/TimeGrid';
import { AddScheduleEntryDialog } from '@/components/schedule/AddScheduleEntryDialog';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { ScheduleTemplatesDialog } from '@/components/schedule/ScheduleTemplatesDialog';
import { NotesSheet } from '@/components/notes/NotesSheet';
import { HabitTrackerTable } from '@/components/schedule/HabitTrackerTable';
import { HabitProgressSidebar } from '@/components/schedule/HabitProgressSidebar';
import { MonthSelector } from '@/components/schedule/MonthSelector';
import { useAutoApplyTemplates, useAutoApplyPreference } from '@/hooks/useAutoApplyTemplates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Schedule() {
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'tracker'>('tracker');
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { getPreference } = useAutoApplyPreference();
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(getPreference());
  
  // Auto-apply templates when date changes
  useAutoApplyTemplates(dateString, autoApplyEnabled);
  
  const { data: entries = [], isLoading } = useScheduleEntries(dateString);
  const { data: monthlyEntries = [], isLoading: isLoadingMonthly } = useMonthlyScheduleEntries(selectedMonth);
  const { data: routines = [] } = useRoutines();
  const completeEntry = useCompleteScheduleEntry();
  const deleteEntry = useDeleteScheduleEntry();

  const handleComplete = async (id: string) => {
    try {
      await completeEntry.mutateAsync(id);
      toast.success('Entry completed! +5 XP');
    } catch (error) {
      toast.error('Failed to complete entry');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Habit Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily habits and build consistency
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotesSheet />
            <ScheduleTemplatesDialog 
              selectedDate={dateString} 
              autoApplyEnabled={autoApplyEnabled}
              onAutoApplyChange={setAutoApplyEnabled}
            />
            <AddScheduleEntryDialog selectedDate={dateString} />
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'daily' | 'tracker')} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="tracker" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Monthly Tracker
              </TabsTrigger>
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily View
              </TabsTrigger>
            </TabsList>
            
            {viewMode === 'tracker' && (
              <MonthSelector 
                selectedMonth={selectedMonth} 
                onMonthChange={setSelectedMonth} 
              />
            )}
          </div>

          {/* Tracker View */}
          <TabsContent value="tracker" className="mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Habit Table */}
              <div className="xl:col-span-3 bg-card border border-border rounded-xl p-4 overflow-hidden">
                {isLoadingMonthly ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-pulse text-muted-foreground">Loading habits...</div>
                  </div>
                ) : (
                  <HabitTrackerTable 
                    routines={routines}
                    entries={monthlyEntries}
                    selectedMonth={selectedMonth}
                    onComplete={handleComplete}
                  />
                )}
              </div>

              {/* Progress Sidebar */}
              <div className="xl:col-span-1">
                <HabitProgressSidebar 
                  routines={routines}
                  entries={monthlyEntries}
                  selectedMonth={selectedMonth}
                />
              </div>
            </div>
          </TabsContent>

          {/* Daily View */}
          <TabsContent value="daily" className="mt-6 space-y-6">
            {/* Date Selector */}
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

            {/* Stats */}
            <ScheduleStats entries={entries} />

            {/* Time Grid */}
            <div className="bg-card border border-border rounded-xl p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">Loading schedule...</div>
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No entries scheduled
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Start planning your day by adding tasks, routines, or custom time blocks.
                  </p>
                </div>
              ) : (
                <TimeGrid
                  entries={entries}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
