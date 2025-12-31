import { Clock, MoreVertical, Pencil, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Routine } from '@/hooks/useRoutines';

interface RoutineCardProps {
  routine: Routine;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
}

const categoryColors = {
  lifestyle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  health: 'bg-green-500/20 text-green-400 border-green-500/30',
  study: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  work: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RoutineCard({ routine, onEdit, onDelete }: RoutineCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Convert days_of_week (1-7, Mon-Sun) to display
  const getActiveDays = () => {
    return routine.days_of_week.map(d => {
      // Convert 1-7 (Mon-Sun) to 0-6 (Sun-Sat) for display
      const index = d === 7 ? 0 : d;
      return dayLabels[index];
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="outline" 
              className={cn('text-xs', categoryColors[routine.category as keyof typeof categoryColors])}
            >
              {routine.category}
            </Badge>
            {routine.is_flexible && (
              <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground border-accent/30">
                Flexible
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {routine.title}
          </h3>
          
          {routine.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {routine.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(routine.start_time)}
                {routine.end_time && ` - ${formatTime(routine.end_time)}`}
                {routine.duration_minutes && !routine.end_time && ` (${routine.duration_minutes}min)`}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{getActiveDays().join(', ')}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-primary font-medium">+{routine.xp_reward} XP</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(routine)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(routine.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
