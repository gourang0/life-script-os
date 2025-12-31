import { Check, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScheduleEntry } from '@/hooks/useScheduleEntries';

interface TimeBlockProps {
  entry: ScheduleEntry;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const typeColors = {
  task: 'border-l-primary bg-primary/10',
  routine: 'border-l-accent bg-accent/10',
  custom: 'border-l-muted-foreground bg-muted/50',
};

const typeLabels = {
  task: 'Task',
  routine: 'Routine',
  custom: 'Custom',
};

export function TimeBlock({ entry, onComplete, onDelete }: TimeBlockProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border-l-4 transition-all duration-200',
        typeColors[entry.entry_type as keyof typeof typeColors] || typeColors.custom,
        entry.is_completed && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {typeLabels[entry.entry_type as keyof typeof typeLabels] || 'Custom'}
            </span>
            {entry.is_completed && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                Completed
              </span>
            )}
          </div>
          <h4 className={cn(
            'font-semibold text-foreground truncate',
            entry.is_completed && 'line-through'
          )}>
            {entry.title}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!entry.is_completed && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
              onClick={() => onComplete(entry.id)}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
