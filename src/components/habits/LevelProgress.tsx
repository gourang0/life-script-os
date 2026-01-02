import { Progress } from '@/components/ui/progress';
import { UserProgress } from '@/types/habit';
import { Trophy, Star, Zap } from 'lucide-react';

interface LevelProgressProps {
  progress: UserProgress;
}

export const LevelProgress = ({ progress }: LevelProgressProps) => {
  const xpPercent = (progress.xp / progress.xpToNextLevel) * 100;

  return (
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Level</p>
          <p className="text-2xl font-bold text-foreground">Level {progress.level}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            XP Progress
          </span>
          <span className="font-medium text-foreground">{progress.xp} / {progress.xpToNextLevel}</span>
        </div>
        <Progress value={xpPercent} className="h-3" />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Star className="w-4 h-4 text-primary" />
        <span>{progress.xpToNextLevel - progress.xp} XP to Level {progress.level + 1}</span>
      </div>
    </div>
  );
};
