import { useState, useMemo } from 'react';
import { useScheduleEntries, useCompleteScheduleEntry } from '@/hooks/useScheduleEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, Loader2, CheckCircle2, Circle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddScheduleEntryDialog } from './AddScheduleEntryDialog';

interface WeeklyTimetableProps {
  selectedDate: Date;
}

export function WeeklyTimetable({ selectedDate }: WeeklyTimetableProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const [selectedDay, setSelectedDay] = useState(selectedDate);
  const dateStr = format(selectedDay, 'yyyy-MM-dd');
  const { data: entries = [], isLoading } = useScheduleEntries(dateStr);
  const completeEntry = useCompleteScheduleEntry();

  const completedCount = entries.filter(e => e.is_completed).length;
  const totalCount = entries.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleComplete = async (entryId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      await completeEntry.mutateAsync(entryId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Weekly Timetable
          </CardTitle>
          <AddScheduleEntryDialog selectedDate={format(selectedDay, 'yyyy-MM-dd')} />
        </div>
        
        {/* Week Day Selector */}
        <div className="flex gap-1 mt-3">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex-1 py-2 px-1 rounded-lg text-center transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : isToday
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className="text-sm font-bold">{format(day, 'd')}</div>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} tasks
            </span>
            <Badge variant={completionRate === 100 ? "default" : "secondary"}>
              {completionRate}%
            </Badge>
          </div>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Circle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tasks scheduled for this day</p>
            <p className="text-xs mt-1">Add entries using the + button</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  entry.is_completed 
                    ? "bg-primary/5 border-primary/20" 
                    : "hover:bg-muted/50 border-border"
                )}
              >
                <Checkbox
                  checked={entry.is_completed}
                  onCheckedChange={() => handleToggleComplete(entry.id, entry.is_completed)}
                  disabled={entry.is_completed || completeEntry.isPending}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    entry.is_completed && "line-through text-muted-foreground"
                  )}>
                    {entry.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {entry.entry_type}
                    </Badge>
                  </div>
                </div>
                {entry.is_completed && (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
