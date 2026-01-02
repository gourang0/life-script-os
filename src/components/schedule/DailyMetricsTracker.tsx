import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useDailyGoal, useUpsertDailyGoal } from '@/hooks/useDailyGoals';
import { toast } from 'sonner';
import { Footprints, Clock, Moon, Save, Loader2, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function DailyMetricsTracker() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: dailyGoal, isLoading } = useDailyGoal(today);
  const upsertDailyGoal = useUpsertDailyGoal();

  const [stepsActual, setStepsActual] = useState<string>('');
  const [workHoursActual, setWorkHoursActual] = useState<string>('');
  const [workMinutesActual, setWorkMinutesActual] = useState<string>('');
  const [sleepHoursActual, setSleepHoursActual] = useState<string>('');
  const [sleepMinutesActual, setSleepMinutesActual] = useState<string>('');

  // Targets
  const [stepsTarget, setStepsTarget] = useState<string>('10000');
  const [workHoursTarget, setWorkHoursTarget] = useState<string>('8');
  const [workMinutesTarget, setWorkMinutesTarget] = useState<string>('0');
  const [sleepHoursTarget, setSleepHoursTarget] = useState<string>('8');
  const [sleepMinutesTarget, setSleepMinutesTarget] = useState<string>('0');

  const [showTargets, setShowTargets] = useState(false);

  // Load data when available
  useEffect(() => {
    if (dailyGoal) {
      setStepsActual(dailyGoal.steps_actual?.toString() || '0');
      const workActualTotal = dailyGoal.work_hours_actual || 0;
      setWorkHoursActual(Math.floor(workActualTotal).toString());
      setWorkMinutesActual(Math.round((workActualTotal % 1) * 60).toString());
      const sleepActualTotal = dailyGoal.sleep_hours_actual || 0;
      setSleepHoursActual(Math.floor(sleepActualTotal).toString());
      setSleepMinutesActual(Math.round((sleepActualTotal % 1) * 60).toString());

      setStepsTarget(dailyGoal.steps_target?.toString() || '10000');
      const workTargetTotal = dailyGoal.work_hours_target || 8;
      setWorkHoursTarget(Math.floor(workTargetTotal).toString());
      setWorkMinutesTarget(Math.round((workTargetTotal % 1) * 60).toString());
      const sleepTargetTotal = dailyGoal.sleep_hours_target || 8;
      setSleepHoursTarget(Math.floor(sleepTargetTotal).toString());
      setSleepMinutesTarget(Math.round((sleepTargetTotal % 1) * 60).toString());
    }
  }, [dailyGoal]);

  const stepsTargetNum = parseInt(stepsTarget) || 10000;
  const workTargetNum = parseInt(workHoursTarget) + parseInt(workMinutesTarget) / 60;
  const sleepTargetNum = parseInt(sleepHoursTarget) + parseInt(sleepMinutesTarget) / 60;

  const stepsActualNum = parseInt(stepsActual) || 0;
  const workActualNum = parseInt(workHoursActual) + parseInt(workMinutesActual) / 60;
  const sleepActualNum = parseInt(sleepHoursActual) + parseInt(sleepMinutesActual) / 60;

  const stepsProgress = Math.min(100, (stepsActualNum / stepsTargetNum) * 100);
  const workProgress = Math.min(100, (workActualNum / workTargetNum) * 100);
  const sleepProgress = Math.min(100, (sleepActualNum / sleepTargetNum) * 100);

  const handleSave = async () => {
    try {
      await upsertDailyGoal.mutateAsync({
        goal_date: today,
        steps_actual: stepsActualNum,
        steps_target: stepsTargetNum,
        work_hours_actual: workActualNum,
        work_hours_target: workTargetNum,
        sleep_hours_actual: sleepActualNum,
        sleep_hours_target: sleepTargetNum,
      });
      toast.success('Daily metrics saved');
    } catch (error) {
      toast.error('Failed to save metrics');
    }
  };

  const hourOptions = Array.from({ length: 25 }, (_, i) => i.toString());
  const minuteOptions = ['0', '15', '30', '45'];
  const stepsOptions = ['0', '1000', '2000', '3000', '4000', '5000', '6000', '7000', '8000', '9000', '10000', '12000', '15000', '20000'];

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Metrics</CardTitle>
          <Collapsible open={showTargets} onOpenChange={setShowTargets}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-1" />
                Targets
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible open={showTargets} onOpenChange={setShowTargets}>
          <CollapsibleContent className="space-y-4 pb-4 border-b border-border mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Set Daily Targets</div>
            
            {/* Steps Target */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <Footprints className="h-4 w-4 text-green-500" />
              </div>
              <Label className="w-20">Steps</Label>
              <Select value={stepsTarget} onValueChange={setStepsTarget}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stepsOptions.map((s) => (
                    <SelectItem key={s} value={s}>{parseInt(s).toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Target */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <Label className="w-20">Work</Label>
              <Select value={workHoursTarget} onValueChange={setWorkHoursTarget}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((h) => (
                    <SelectItem key={h} value={h}>{h}h</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={workMinutesTarget} onValueChange={setWorkMinutesTarget}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}m</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sleep Target */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Moon className="h-4 w-4 text-purple-500" />
              </div>
              <Label className="w-20">Sleep</Label>
              <Select value={sleepHoursTarget} onValueChange={setSleepHoursTarget}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((h) => (
                    <SelectItem key={h} value={h}>{h}h</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sleepMinutesTarget} onValueChange={setSleepMinutesTarget}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}m</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Steps Actual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <Footprints className="h-4 w-4 text-green-500" />
              </div>
              <Label className="text-sm font-medium">Steps</Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {parseInt(stepsActual || '0').toLocaleString()} / {stepsTargetNum.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={stepsActual || '0'} onValueChange={setStepsActual}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stepsOptions.map((s) => (
                  <SelectItem key={s} value={s}>{parseInt(s).toLocaleString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Progress value={stepsProgress} className="flex-1" />
          </div>
        </div>

        {/* Work Hours Actual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <Label className="text-sm font-medium">Work / Study</Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {parseInt(workHoursActual || '0')}h {parseInt(workMinutesActual || '0')}m / {parseInt(workHoursTarget)}h {parseInt(workMinutesTarget)}m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={workHoursActual || '0'} onValueChange={setWorkHoursActual}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={h}>{h}h</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={workMinutesActual || '0'} onValueChange={setWorkMinutesActual}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}m</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Progress value={workProgress} className="flex-1" />
          </div>
        </div>

        {/* Sleep Hours Actual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/10">
                <Moon className="h-4 w-4 text-purple-500" />
              </div>
              <Label className="text-sm font-medium">Sleep</Label>
            </div>
            <span className="text-xs text-muted-foreground">
              {parseInt(sleepHoursActual || '0')}h {parseInt(sleepMinutesActual || '0')}m / {parseInt(sleepHoursTarget)}h {parseInt(sleepMinutesTarget)}m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sleepHoursActual || '0'} onValueChange={setSleepHoursActual}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={h}>{h}h</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sleepMinutesActual || '0'} onValueChange={setSleepMinutesActual}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}m</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Progress value={sleepProgress} className="flex-1" />
          </div>
        </div>

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
