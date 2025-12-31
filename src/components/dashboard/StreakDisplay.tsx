import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  const isOnFire = currentStreak >= 7;

  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className={cn(
          "relative inline-flex items-center justify-center",
          isOnFire && "animate-pulse"
        )}>
          <Flame 
            className={cn(
              "w-12 h-12 transition-colors",
              currentStreak > 0 ? "text-chart-2 fill-chart-2" : "text-muted"
            )} 
          />
          {isOnFire && (
            <div className="absolute inset-0 w-12 h-12 bg-chart-2/30 rounded-full blur-lg" />
          )}
        </div>
        <p className="text-3xl font-bold text-foreground mt-2">{currentStreak}</p>
        <p className="text-sm text-muted-foreground">Day Streak</p>
      </div>

      <div className="h-16 w-px bg-border" />

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12">
          <span className="text-2xl">🏆</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-2">{bestStreak}</p>
        <p className="text-sm text-muted-foreground">Best Streak</p>
      </div>
    </div>
  );
}
