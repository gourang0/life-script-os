import { CheckCircle2, Clock, Target } from 'lucide-react';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';

interface ScheduleStatsProps {
  entries: ScheduleEntry[];
}

export function ScheduleStats({ entries }: ScheduleStatsProps) {
  const totalEntries = entries.length;
  const completedEntries = entries.filter(e => e.is_completed).length;
  const completionRate = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;
  
  const totalMinutes = entries.reduce((acc, entry) => {
    const [startH, startM] = entry.start_time.split(':').map(Number);
    const [endH, endM] = entry.end_time.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return acc + Math.max(0, duration);
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Target className="w-4 h-4" />
          <span className="text-xs font-medium">Scheduled</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalEntries}</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium">Completed</span>
        </div>
        <p className="text-2xl font-bold text-green-500">
          {completedEntries}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            ({completionRate}%)
          </span>
        </p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium">Total Time</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          {hours}h {minutes}m
        </p>
      </div>
    </div>
  );
}
