import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useExceptions } from '@/hooks/useExceptions';
import { useDeleteException } from '@/hooks/useDeleteException';
import { AddExceptionDialog } from '@/components/exceptions/AddExceptionDialog';
import { ExceptionCard } from '@/components/exceptions/ExceptionCard';
import { ExceptionStats } from '@/components/exceptions/ExceptionStats';
import { DateSelector } from '@/components/schedule/DateSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Exceptions() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: dailyExceptions = [], isLoading: dailyLoading } = useExceptions(dateString);
  const { data: allExceptions = [], isLoading: allLoading } = useExceptions();
  const deleteException = useDeleteException();

  const handleDelete = async (id: string) => {
    try {
      await deleteException.mutateAsync(id);
      toast.success('Exception deleted');
    } catch (error) {
      toast.error('Failed to delete exception');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Exceptions</h1>
              <p className="text-sm text-muted-foreground">Track and reflect on missed tasks</p>
            </div>
          </div>

          <AddExceptionDialog selectedDate={dateString} />
        </div>

        {/* Stats */}
        <ExceptionStats exceptions={allExceptions} />

        {/* Tabs */}
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="all">All Exceptions</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-4">
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
            
            {dailyLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : dailyExceptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No exceptions logged for this day</p>
                <p className="text-sm">That's a good thing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyExceptions.map((exception) => (
                  <ExceptionCard 
                    key={exception.id} 
                    exception={exception} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            {allLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : allExceptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No exceptions logged yet</p>
                <p className="text-sm">Log exceptions to track patterns over time</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allExceptions.map((exception) => (
                  <ExceptionCard 
                    key={exception.id} 
                    exception={exception} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
