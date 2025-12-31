import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDailyGoal, useUpsertDailyGoal } from '@/hooks/useDailyGoals';
import { toast } from 'sonner';
import { Footprints, Clock, Moon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface DailyTrackerProps {
  selectedDate: Date;
}

export function DailyTracker({ selectedDate }: DailyTrackerProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyGoal, isLoading } = useDailyGoal(dateString);
  const upsertDailyGoal = useUpsertDailyGoal();

  const [stepsActual, setStepsActual] = useState<string>('');
  const [workHoursActual, setWorkHoursActual] = useState<string>('');
  const [sleepHoursActual, setSleepHoursActual] = useState<string>('');

  // Initialize values when data loads
  const stepsValue = stepsActual || (dailyGoal?.steps_actual?.toString() || '0');
  const workValue = workHoursActual || (dailyGoal?.work_hours_actual?.toString() || '0');
  const sleepValue = sleepHoursActual || (dailyGoal?.sleep_hours_actual?.toString() || '0');

  const stepsTarget = dailyGoal?.steps_target || 10000;
  const workTarget = dailyGoal?.work_hours_target || 8;
  const sleepTarget = dailyGoal?.sleep_hours_target || 8;

  const stepsProgress = Math.min(100, (parseInt(stepsValue) / stepsTarget) * 100);
  const workProgress = Math.min(100, (parseFloat(workValue) / workTarget) * 100);
  const sleepProgress = Math.min(100, (parseFloat(sleepValue) / sleepTarget) * 100);

  const handleSave = async () => {
    try {
      await upsertDailyGoal.mutateAsync({
        goal_date: dateString,
        steps_actual: parseInt(stepsValue) || 0,
        work_hours_actual: parseFloat(workValue) || 0,
        sleep_hours_actual: parseFloat(sleepValue) || 0,
      });
      toast.success('Daily progress saved');
      // Reset local state
      setStepsActual('');
      setWorkHoursActual('');
      setSleepHoursActual('');
    } catch (error) {
      toast.error('Failed to save progress');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const trackers = [
    {
      label: 'Steps',
      icon: Footprints,
      actual: stepsValue,
      setActual: setStepsActual,
      target: stepsTarget,
      progress: stepsProgress,
      unit: 'steps',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Work Hours',
      icon: Clock,
      actual: workValue,
      setActual: setWorkHoursActual,
      target: workTarget,
      progress: workProgress,
      unit: 'hours',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Sleep',
      icon: Moon,
      actual: sleepValue,
      setActual: setSleepHoursActual,
      target: sleepTarget,
      progress: sleepProgress,
      unit: 'hours',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Daily Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trackers.map((tracker) => (
          <div key={tracker.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${tracker.bgColor}`}>
                  <tracker.icon className={`h-4 w-4 ${tracker.color}`} />
                </div>
                <Label className="text-sm font-medium">{tracker.label}</Label>
              </div>
              <span className="text-xs text-muted-foreground">
                {tracker.actual} / {tracker.target} {tracker.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tracker.actual}
                onChange={(e) => tracker.setActual(e.target.value)}
                placeholder="0"
                className="h-8"
                min={0}
                step={tracker.label === 'Steps' ? 100 : 0.5}
              />
              <Progress value={tracker.progress} className="flex-1" />
            </div>
          </div>
        ))}

        <Button 
          onClick={handleSave} 
          className="w-full mt-4"
          disabled={upsertDailyGoal.isPending}
        >
          {upsertDailyGoal.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Progress
        </Button>
      </CardContent>
    </Card>
  );
}
