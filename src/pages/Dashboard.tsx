import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { useDailyGoal } from '@/hooks/useDailyGoals';
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
import { Target, CheckCircle, Clock, Flame, Plus, Footprints, Briefcase, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tasks } = useTasks();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: dailyGoals } = useDailyGoal(today);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Today's Tasks" value={`${completedToday}/${todayTasks.length}`} icon={<Target className="w-6 h-6" />} variant="primary" />
          <StatsCard title="Total Completed" value={profile?.total_tasks_completed || 0} icon={<CheckCircle className="w-6 h-6" />} variant="success" />
          <StatsCard title="Pending Tasks" value={pendingTasks.length} icon={<Clock className="w-6 h-6" />} />
          <StatsCard title="Current Streak" value={`${profile?.current_streak || 0} days`} icon={<Flame className="w-6 h-6" />} variant="warning" />
        </div>

        {/* Daily Metrics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Set and track daily metrics in <Link to="/schedule" className="text-primary hover:underline">Habit Quest</Link>
            </p>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Tasks</CardTitle>
                <Link to="/tasks"><Button variant="ghost" size="sm">View All</Button></Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tasks scheduled for today. <Link to="/tasks" className="text-primary hover:underline">Add one!</Link></p>
                ) : (
                  todayTasks.slice(0, 3).map(task => <TaskCard key={task.id} task={task} />)
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
