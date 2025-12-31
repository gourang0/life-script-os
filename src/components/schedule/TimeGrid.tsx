import { ScheduleEntry } from '@/hooks/useScheduleEntries';
import { TimeBlock } from './TimeBlock';

interface TimeGridProps {
  entries: ScheduleEntry[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export function TimeGrid({ entries, onComplete, onDelete }: TimeGridProps) {
  const getEntriesForHour = (hour: number) => {
    return entries.filter((entry) => {
      const startHour = parseInt(entry.start_time.split(':')[0]);
      return startHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  return (
    <div className="space-y-1">
      {hours.map((hour) => {
        const hourEntries = getEntriesForHour(hour);
        const hasEntries = hourEntries.length > 0;

        return (
          <div key={hour} className="flex gap-4">
            {/* Time label */}
            <div className="w-16 flex-shrink-0 text-right">
              <span className="text-xs text-muted-foreground font-medium">
                {formatHour(hour)}
              </span>
            </div>

            {/* Time slot */}
            <div className="flex-1 min-h-[3rem] border-t border-border/50 pt-2">
              {hasEntries ? (
                <div className="space-y-2">
                  {hourEntries.map((entry) => (
                    <TimeBlock
                      key={entry.id}
                      entry={entry}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-8" /> // Empty slot spacer
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
