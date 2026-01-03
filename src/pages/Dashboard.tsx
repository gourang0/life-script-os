import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { useDailyGoal, useUpsertDailyGoal } from '@/hooks/useDailyGoals';
import { useReminders, useCreateReminder, useDeleteReminder, useUpdateReminder } from '@/hooks/useReminders';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { XPProgressRing } from '@/components/dashboard/XPProgressRing';
import { StreakDisplay } from '@/components/dashboard/StreakDisplay';
import { AIMotivation } from '@/components/dashboard/AIMotivation';
import { UrgentGoalCountdown } from '@/components/dashboard/UrgentGoalCountdown';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Target, CheckCircle, Clock, Flame, Plus, Footprints, Briefcase, Moon, ChevronDown, Settings, Bell, Trash2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tasks } = useTasks();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: dailyGoals } = useDailyGoal(today);
  const { mutateAsync: upsertDailyGoal } = useUpsertDailyGoal();
  const { data: reminders } = useReminders();
  const { mutateAsync: createReminder } = useCreateReminder();
  const { mutateAsync: deleteReminder } = useDeleteReminder();
  const { mutateAsync: updateReminder } = useUpdateReminder();
  
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [stepsTarget, setStepsTarget] = useState('5000');
  const [stepsActual, setStepsActual] = useState(0);
  const [stepsManual, setStepsManual] = useState('0');
  const [workTarget, setWorkTarget] = useState('0');
  const [workActual, setWorkActual] = useState(0);
  const [workManual, setWorkManual] = useState('0');
  const [sleepTarget, setSleepTarget] = useState('0');
  const [sleepActual, setSleepActual] = useState(0);
  const [sleepManual, setSleepManual] = useState('0');
  
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderContent, setNewReminderContent] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState('2');

  useEffect(() => {
    if (dailyGoals) {
      setStepsTarget(String(dailyGoals.steps_target || 5000));
      setStepsActual(dailyGoals.steps_actual || 0);
      setStepsManual(String(dailyGoals.steps_actual || 0));
      setWorkTarget(String(dailyGoals.work_hours_target || 0));
      setWorkActual(dailyGoals.work_hours_actual || 0);
      setWorkManual(String(dailyGoals.work_hours_actual || 0));
      setSleepTarget(String(dailyGoals.sleep_hours_target || 0));
      setSleepActual(dailyGoals.sleep_hours_actual || 0);
      setSleepManual(String(dailyGoals.sleep_hours_actual || 0));
    }
  }, [dailyGoals]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleSaveMetrics = async () => {
    try {
      await upsertDailyGoal({
        goal_date: today,
        steps_target: parseInt(stepsTarget) || 0,
        steps_actual: stepsActual,
        work_hours_target: parseInt(workTarget) || 0,
        work_hours_actual: workActual,
        sleep_hours_target: parseInt(sleepTarget) || 0,
        sleep_hours_actual: sleepActual,
      });
      toast({ title: 'Metrics saved successfully!' });
    } catch {
      toast({ title: 'Failed to save metrics', variant: 'destructive' });
    }
  };

  // Auto-save metrics when values change
  useEffect(() => {
    if (dailyGoals) {
      const timeoutId = setTimeout(() => {
        handleSaveMetrics();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsActual, workActual, sleepActual, stepsTarget, workTarget, sleepTarget]);

  const handleAddReminder = async () => {
    if (!newReminderContent.trim()) return;
    try {
      await createReminder({
        content: newReminderContent.trim(),
        priority: parseInt(newReminderPriority),
      });
      setNewReminderContent('');
      setNewReminderPriority('2');
      setIsAddingReminder(false);
      toast({ title: 'Reminder added!' });
    } catch {
      toast({ title: 'Failed to add reminder', variant: 'destructive' });
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await updateReminder({ id, is_completed: true });
    } catch {
      toast({ title: 'Failed to complete reminder', variant: 'destructive' });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
    } catch {
      toast({ title: 'Failed to delete reminder', variant: 'destructive' });
    }
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  const todayTasks = tasks?.filter(t => t.scheduled_date === today) || [];
  const completedToday = todayTasks.filter(t => t.is_completed).length;
  const pendingTasks = tasks?.filter(t => !t.is_completed) || [];

  // Daily metrics calculations
  const stepsProgress = dailyGoals?.steps_target ? ((dailyGoals.steps_actual || 0) / dailyGoals.steps_target) * 100 : 0;
  const workProgress = dailyGoals?.work_hours_target ? ((dailyGoals.work_hours_actual || 0) / dailyGoals.work_hours_target) * 100 : 0;
  const sleepProgress = dailyGoals?.sleep_hours_target ? ((dailyGoals.sleep_hours_actual || 0) / dailyGoals.sleep_hours_target) * 100 : 0;

  const stepTargetOptions = ['5000', '6000', '7000', '8000', '9000', '10000', '12000', '15000', '18000', '20000', '22000', '25000'];
  const hourOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'border-l-destructive bg-destructive/5';
    if (priority === 2) return 'border-l-chart-4 bg-chart-4/5';
    return 'border-l-muted-foreground bg-muted/30';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 3) return 'High';
    if (priority === 2) return 'Medium';
    return 'Low';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.display_name || 'Warrior'}!</p>
          </div>
          <Link to="/tasks">
            <Button><Plus className="w-4 h-4 mr-2" />New Task</Button>
          </Link>
        </div>

        {/* Today's Tasks - Moved to top */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Tasks</CardTitle>
            <Link to="/tasks"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks scheduled for today. <Link to="/tasks" className="text-primary hover:underline">Add one!</Link></p>
            ) : (
              todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-1 h-8 rounded-full ${
                      task.priority === 'high' ? 'bg-destructive' :
                      task.priority === 'medium' ? 'bg-chart-2' : 'bg-chart-3'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.is_completed ? (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reminders Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Reminders
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAddingReminder(!isAddingReminder)}
            >
              {isAddingReminder ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {isAddingReminder && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter reminder..."
                  value={newReminderContent}
                  onChange={(e) => setNewReminderContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddReminder()}
                  className="flex-1"
                />
                <Select value={newReminderPriority} onValueChange={setNewReminderPriority}>
                  <SelectTrigger className="w-28 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddReminder} size="sm">Add</Button>
              </div>
            )}
            
            {reminders && reminders.length > 0 ? (
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getPriorityColor(reminder.priority)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        {getPriorityLabel(reminder.priority)}
                      </span>
                      <span className="text-sm">{reminder.content}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCompleteReminder(reminder.id)}
                      >
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No reminders yet. Add one to stay on track!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Metrics Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Steps</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals?.steps_actual?.toLocaleString() || 0} / {dailyGoals?.steps_target?.toLocaleString() || 0}
                  </span>
                </div>
                <Progress value={Math.min(stepsProgress, 100)} className="h-2" />
              </div>

              {/* Work Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium">Work Hours</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals?.work_hours_actual || 0}h / {dailyGoals?.work_hours_target || 0}h
                  </span>
                </div>
                <Progress value={Math.min(workProgress, 100)} className="h-2" />
              </div>

              {/* Sleep Hours */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-chart-3" />
                    <span className="text-sm font-medium">Sleep Hours</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dailyGoals?.sleep_hours_actual || 0}h / {dailyGoals?.sleep_hours_target || 0}h
                  </span>
                </div>
                <Progress value={Math.min(sleepProgress, 100)} className="h-2" />
              </div>
            </div>

            <Collapsible open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80">
                  <Settings className="w-4 h-4" />
                  Set Daily Metrics
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMetricsOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Steps Settings */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Footprints className="w-4 h-4 text-primary" />
                      Steps
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Target</label>
                        <Select value={stepsTarget} onValueChange={setStepsTarget}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {stepTargetOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{parseInt(opt).toLocaleString()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Actual: {stepsActual.toLocaleString()}</label>
                        <Slider
                          value={[stepsActual]}
                          onValueChange={(v) => {
                            setStepsActual(v[0]);
                            setStepsManual(String(v[0]));
                          }}
                          max={30000}
                          step={500}
                          className="mt-2"
                        />
                        <Input
                          type="number"
                          value={stepsManual}
                          onChange={(e) => {
                            setStepsManual(e.target.value);
                            setStepsActual(parseInt(e.target.value) || 0);
                          }}
                          className="mt-2 bg-background"
                          placeholder="Manual entry"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Hours Settings */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="w-4 h-4 text-chart-2" />
                      Work Hours
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Target</label>
                        <Select value={workTarget} onValueChange={setWorkTarget}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {hourOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}h</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Actual: {workActual}h</label>
                        <Slider
                          value={[workActual]}
                          onValueChange={(v) => {
                            setWorkActual(v[0]);
                            setWorkManual(String(v[0]));
                          }}
                          max={16}
                          step={0.5}
                          className="mt-2"
                        />
                        <Input
                          type="number"
                          value={workManual}
                          onChange={(e) => {
                            setWorkManual(e.target.value);
                            setWorkActual(parseFloat(e.target.value) || 0);
                          }}
                          className="mt-2 bg-background"
                          placeholder="Manual entry"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sleep Hours Settings */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Moon className="w-4 h-4 text-chart-3" />
                      Sleep Hours
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Target</label>
                        <Select value={sleepTarget} onValueChange={setSleepTarget}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {hourOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}h</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Actual: {sleepActual}h</label>
                        <Slider
                          value={[sleepActual]}
                          onValueChange={(v) => {
                            setSleepActual(v[0]);
                            setSleepManual(String(v[0]));
                          }}
                          max={16}
                          step={0.5}
                          className="mt-2"
                        />
                        <Input
                          type="number"
                          value={sleepManual}
                          onChange={(e) => {
                            setSleepManual(e.target.value);
                            setSleepActual(parseFloat(e.target.value) || 0);
                          }}
                          className="mt-2 bg-background"
                          placeholder="Manual entry"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <UrgentGoalCountdown />
            <Card>
              <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <XPProgressRing level={profile?.level || 1} currentXP={(profile?.xp_points || 0) % 100} xpForNextLevel={100} size="lg" />
                <StreakDisplay currentStreak={profile?.current_streak || 0} bestStreak={profile?.best_streak || 0} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <AIMotivation />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
