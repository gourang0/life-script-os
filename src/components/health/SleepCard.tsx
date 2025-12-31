import { Moon, Clock } from 'lucide-react';
import { SleepLog } from '@/hooks/useHealth';
import { cn } from '@/lib/utils';

interface SleepCardProps {
  log: SleepLog;
}

const qualityConfig = {
  excellent: { icon: '😴', color: 'text-green-500', bg: 'bg-green-500/10' },
  good: { icon: '🙂', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  fair: { icon: '😐', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  poor: { icon: '😫', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function SleepCard({ log }: SleepCardProps) {
  const quality = log.quality ? qualityConfig[log.quality] : null;

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {log.log_date}
          </span>
        </div>
        {quality && (
          <span className={cn('text-xs px-2 py-1 rounded-full', quality.bg, quality.color)}>
            {quality.icon} {log.quality}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Sleep</p>
          <p className="text-sm font-medium text-foreground">
            {formatTime(log.sleep_time)}
          </p>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="h-px bg-border relative">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
              {log.duration_hours && (
                <span className="bg-background px-2 text-xs text-primary font-medium">
                  {log.duration_hours.toFixed(1)}h
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Wake</p>
          <p className="text-sm font-medium text-foreground">
            {formatTime(log.wake_time)}
          </p>
        </div>
      </div>

      {log.notes && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          {log.notes}
        </p>
      )}
    </div>
  );
}
