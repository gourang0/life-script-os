import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Goal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals';
import { useRecordGoalProgress } from '@/hooks/useGoalProgressHistory';
import { CreateGoalDialog } from './CreateGoalDialog';
import { toast } from 'sonner';
import { Target, Calendar, Trash2, Edit, CheckCircle, Sparkles, Flame, Trophy } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  health: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  career: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  learning: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  finance: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  relationships: 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30',
  lifestyle: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
  other: 'bg-muted text-muted-foreground border-muted',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  health: <Flame className="h-3 w-3" />,
  career: <Trophy className="h-3 w-3" />,
  learning: <Sparkles className="h-3 w-3" />,
};

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [progress, setProgress] = useState(goal.progress_percentage);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const recordProgress = useRecordGoalProgress();

  const daysRemaining = goal.target_date 
    ? differenceInDays(parseISO(goal.target_date), new Date())
    : null;

  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;
  const isOverdue = daysRemaining !== null && daysRemaining <= 0 && !goal.is_completed;

  useEffect(() => {
    setProgress(goal.progress_percentage);
  }, [goal.progress_percentage]);

  const handleProgressChange = async (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
  };

  const handleProgressCommit = async () => {
    if (progress === goal.progress_percentage) return;
    
    setIsUpdating(true);
    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        progress_percentage: progress,
        is_completed: progress >= 100,
      });
      
      await recordProgress.mutateAsync({ goalId: goal.id, progress });
      
      if (progress >= 100) {
        setShowCelebration(true);
        toast.success('Congratulations! Goal completed! 🎉', {
          icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        });
        setTimeout(() => setShowCelebration(false), 2000);
      }
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompletionToggle = async (checked: boolean) => {
    if (checked && !reason.trim()) {
      setShowReason(true);
      return;
    }
    
    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        is_completed: checked,
        progress_percentage: checked ? 100 : progress,
        description: checked && reason.trim() 
          ? `${goal.description || ''}\n\n✅ Achievement Note: ${reason.trim()}`
          : goal.description,
      });
      
      if (checked) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      toast.success(checked ? 'Goal marked as achieved! 🎉' : 'Goal unmarked');
      setShowReason(false);
      setReason('');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const handleSaveReason = async () => {
    await handleCompletionToggle(true);
  };

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  return (
    <Card 
      variant={goal.is_completed ? "glow" : "interactive"}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        goal.is_completed && "border-primary/50 bg-primary/5",
        isUrgent && !goal.is_completed && "border-yellow-500/50 animate-pulse",
        isOverdue && "border-destructive/50",
        showCelebration && "animate-bounce-in"
      )}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-yellow-500 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress gradient accent */}
      <div 
        className="absolute top-0 left-0 h-1 progress-gradient transition-all duration-500"
        style={{ width: `${progress}%` }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                variant="animated"
                checked={goal.is_completed}
                onCheckedChange={handleCompletionToggle}
                className="h-5 w-5"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className={cn(
                "text-base transition-all duration-300",
                goal.is_completed && "line-through text-muted-foreground"
              )}>
                {goal.title}
              </CardTitle>
              {goal.category && (
                <Badge variant="outline" className={cn(CATEGORY_COLORS[goal.category], "gap-1")}>
                  {CATEGORY_ICONS[goal.category]}
                  {goal.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CreateGoalDialog
              goal={goal}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showReason && (
          <div className="space-y-2 p-3 glass rounded-lg border border-primary/20 animate-slide-up">
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Why did you achieve this goal?
            </p>
            <Textarea
              placeholder="Describe what helped you succeed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="transition-all focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveReason} disabled={!reason.trim()} className="hover:scale-105 transition-transform">
                Mark Complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReason(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {goal.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{goal.description}</p>
        )}

        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Target: {format(parseISO(goal.target_date), 'MMM d, yyyy')}</span>
            {daysRemaining !== null && daysRemaining > 0 && (
              <Badge 
                variant={isUrgent ? "warning" : "secondary"} 
                className={cn("ml-auto", isUrgent && "animate-wiggle")}
              >
                {daysRemaining} days left
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="destructive" className="ml-auto animate-pulse">
                Overdue
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className={cn(
              "font-bold text-lg transition-all",
              isUpdating && "animate-number-pop",
              progress >= 100 && "text-primary gradient-text"
            )}>
              {progress}%
            </span>
          </div>
          <Progress 
            value={progress} 
            variant={progress >= 100 ? "glow" : "gradient"}
            className="h-3"
          />
          {!goal.is_completed && (
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              onValueCommit={handleProgressCommit}
              max={100}
              step={5}
              className="py-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}