import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { XPProgressRing } from '@/components/dashboard/XPProgressRing';
import { StreakDisplay } from '@/components/dashboard/StreakDisplay';
import { AIMotivation } from '@/components/dashboard/AIMotivation';
import { UrgentGoalCountdown } from '@/components/dashboard/UrgentGoalCountdown';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckCircle, Clock, Flame, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tasks } = useTasks();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks?.filter(t => t.scheduled_date === today) || [];
  const completedToday = todayTasks.filter(t => t.is_completed).length;
  const pendingTasks = tasks?.filter(t => !t.is_completed) || [];

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
