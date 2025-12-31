import { Clock, Flame, Footprints, MapPin } from 'lucide-react';
import { ExerciseLog } from '@/hooks/useHealth';

interface ExerciseCardProps {
  log: ExerciseLog;
}

const exerciseIcons: Record<string, string> = {
  walking: '🚶',
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  gym: '🏋️',
  yoga: '🧘',
  sports: '⚽',
  hiit: '💪',
  stretching: '🤸',
  other: '🎯',
};

export function ExerciseCard({ log }: ExerciseCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{exerciseIcons[log.exercise_type] || '🎯'}</span>
        <div className="flex-1">
          <h4 className="font-medium text-foreground capitalize mb-2">
            {log.exercise_type}
          </h4>
          
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {log.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{log.duration_minutes} min</span>
              </div>
            )}
            {log.calories_burned && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-3 h-3" />
                <span>{log.calories_burned} kcal</span>
              </div>
            )}
            {log.steps && (
              <div className="flex items-center gap-1 text-green-400">
                <Footprints className="w-3 h-3" />
                <span>{log.steps.toLocaleString()} steps</span>
              </div>
            )}
            {log.distance_km && (
              <div className="flex items-center gap-1 text-blue-400">
                <MapPin className="w-3 h-3" />
                <span>{log.distance_km} km</span>
              </div>
            )}
          </div>

          {log.notes && (
            <p className="text-xs text-muted-foreground mt-2">{log.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
