import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
}

export const StreakCounter = ({ streak }: StreakCounterProps) => {
  const isActive = streak > 0;

  return (
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-full w-12 h-12 flex items-center justify-center transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Flame className={cn("w-6 h-6", isActive && "animate-pulse")} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="text-2xl font-bold text-foreground">
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </p>
        </div>
      </div>
      
      <p className="mt-3 text-sm text-muted-foreground">
        {isActive 
          ? `You're on fire! Keep completing all habits daily.`
          : 'Complete all habits today to start a streak!'
        }
      </p>
    </div>
  );
};
