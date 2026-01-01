import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Goal, useUpdateGoal, useDeleteGoal } from '@/hooks/useGoals';
import { CreateGoalDialog } from './CreateGoalDialog';
import { toast } from 'sonner';
import { Target, Calendar, Trash2, Edit, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  health: 'bg-green-500/10 text-green-600',
  career: 'bg-blue-500/10 text-blue-600',
  learning: 'bg-purple-500/10 text-purple-600',
  finance: 'bg-yellow-500/10 text-yellow-600',
  relationships: 'bg-pink-500/10 text-pink-600',
  lifestyle: 'bg-orange-500/10 text-orange-600',
  other: 'bg-gray-500/10 text-gray-600',
};

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [progress, setProgress] = useState(goal.progress_percentage);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const daysRemaining = goal.target_date 
    ? differenceInDays(parseISO(goal.target_date), new Date())
    : null;

  const handleProgressChange = async (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
  };

  const handleProgressCommit = async () => {
    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        progress_percentage: progress,
        is_completed: progress >= 100,
      });
      if (progress >= 100) {
        toast.success('Congratulations! Goal completed! 🎉');
      }
    } catch (error) {
      toast.error('Failed to update progress');
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
    <Card className={goal.is_completed ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={goal.is_completed}
                onCheckedChange={handleCompletionToggle}
                className="h-5 w-5"
              />
            </div>
            <div className="space-y-1">
              <CardTitle className={`text-base ${goal.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.title}
              </CardTitle>
              {goal.category && (
                <Badge variant="outline" className={CATEGORY_COLORS[goal.category] || ''}>
                  {goal.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <CreateGoalDialog
              goal={goal}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showReason && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-medium">Why did you achieve this goal?</p>
            <Textarea
              placeholder="Describe what helped you succeed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveReason} disabled={!reason.trim()}>
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
              <Badge variant="secondary" className="ml-auto">
                {daysRemaining} days left
              </Badge>
            )}
            {daysRemaining !== null && daysRemaining <= 0 && !goal.is_completed && (
              <Badge variant="destructive" className="ml-auto">
                Overdue
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
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
