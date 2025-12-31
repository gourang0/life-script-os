import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useDailyGoal, useUpsertDailyGoal } from '@/hooks/useDailyGoals';
import { toast } from 'sonner';
import { Settings, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface GoalTargetsProps {
  selectedDate: Date;
}

export function GoalTargets({ selectedDate }: GoalTargetsProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyGoal, isLoading } = useDailyGoal(dateString);
  const upsertDailyGoal = useUpsertDailyGoal();

  const [stepsTarget, setStepsTarget] = useState('10000');
  const [workTarget, setWorkTarget] = useState('8');
  const [sleepTarget, setSleepTarget] = useState('8');

  useEffect(() => {
    if (dailyGoal) {
      setStepsTarget(dailyGoal.steps_target?.toString() || '10000');
      setWorkTarget(dailyGoal.work_hours_target?.toString() || '8');
      setSleepTarget(dailyGoal.sleep_hours_target?.toString() || '8');
    }
  }, [dailyGoal]);

  const handleSaveTargets = async () => {
    try {
      await upsertDailyGoal.mutateAsync({
        goal_date: dateString,
        steps_target: parseInt(stepsTarget) || 10000,
        work_hours_target: parseFloat(workTarget) || 8,
        sleep_hours_target: parseFloat(sleepTarget) || 8,
      });
      toast.success('Targets updated');
    } catch (error) {
      toast.error('Failed to update targets');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Daily Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Steps</Label>
            <Input
              type="number"
              value={stepsTarget}
              onChange={(e) => setStepsTarget(e.target.value)}
              className="h-8"
              min={0}
              step={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Work (hrs)</Label>
            <Input
              type="number"
              value={workTarget}
              onChange={(e) => setWorkTarget(e.target.value)}
              className="h-8"
              min={0}
              max={24}
              step={0.5}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sleep (hrs)</Label>
            <Input
              type="number"
              value={sleepTarget}
              onChange={(e) => setSleepTarget(e.target.value)}
              className="h-8"
              min={0}
              max={24}
              step={0.5}
            />
          </div>
        </div>
        <Button 
          onClick={handleSaveTargets} 
          variant="outline" 
          size="sm" 
          className="w-full"
          disabled={upsertDailyGoal.isPending}
        >
          Save Targets
        </Button>
      </CardContent>
    </Card>
  );
}
