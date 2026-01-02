import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface OverallProgressProps {
  completed: number;
  goal: number;
  percentage: number;
}

export const OverallProgress = ({ completed, goal, percentage }: OverallProgressProps) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
        <Target className="w-5 h-5 text-primary" />
        Overall Progress
      </h3>
      
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-primary">{percentage}%</div>
        <p className="text-sm text-muted-foreground">Monthly Goal</p>
      </div>

      <Progress value={percentage} className="h-4 mb-4" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <div>
            <p className="text-muted-foreground">Completed</p>
            <p className="font-semibold text-foreground">{completed}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-semibold text-foreground">{goal - completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
