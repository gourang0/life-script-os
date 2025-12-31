import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useScheduleEntries, useCompleteScheduleEntry, useDeleteScheduleEntry } from '@/hooks/useScheduleEntries';
import { DateSelector } from '@/components/schedule/DateSelector';
import { TimeGrid } from '@/components/schedule/TimeGrid';
import { AddScheduleEntryDialog } from '@/components/schedule/AddScheduleEntryDialog';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { toast } from 'sonner';

export default function Schedule() {
  const { user, loading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: entries = [], isLoading } = useScheduleEntries(dateString);
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
              Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan your day with time-blocked activities
            </p>
          </div>
          <AddScheduleEntryDialog selectedDate={dateString} />
        </div>

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
      </div>
    </AppLayout>
  );
}
