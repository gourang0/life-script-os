import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDailySummaries, useExceptionAnalytics } from '@/hooks/useAnalytics';
import { useGenerateDailySummary } from '@/hooks/useGenerateDailySummary';
import { useHabitTracker } from '@/hooks/useHabitTracker';
import { DisciplineChart } from '@/components/analytics/DisciplineChart';
import { ProductivityChart } from '@/components/analytics/ProductivityChart';
import { ExceptionPatternsChart } from '@/components/analytics/ExceptionPatternsChart';
import { XPChart } from '@/components/analytics/XPChart';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { TopHabits } from '@/components/habits/TopHabits';
import { WeeklyChart } from '@/components/habits/WeeklyChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  const days = parseInt(timeRange);
  
  const { data: summaries = [], isLoading: summariesLoading, refetch } = useDailySummaries(days);
  const { data: exceptions = [], isLoading: exceptionsLoading } = useExceptionAnalytics(days);
  const generateSummary = useGenerateDailySummary();
  const { habits, getWeeklyData } = useHabitTracker();

  const isLoading = summariesLoading || exceptionsLoading;

  const handleGenerateSummary = async () => {
    try {
      // Generate for yesterday
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      await generateSummary.mutateAsync(yesterday);
      toast.success('Daily summary generated');
      refetch();
    } catch (error) {
      toast.error('Failed to generate summary');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">Track your progress over time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateSummary}
              disabled={generateSummary.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateSummary.isPending ? 'animate-spin' : ''}`} />
              Generate Summary
            </Button>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <AnalyticsSummary summaries={summaries} exceptionCount={exceptions.length} />

            {/* Habit Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopHabits habits={habits} />
              <WeeklyChart data={getWeeklyData()} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DisciplineChart data={summaries} />
              <ProductivityChart data={summaries} />
              <XPChart data={summaries} />
              <ExceptionPatternsChart data={exceptions} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
