import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';

export default function Tasks() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: tasks, isLoading } = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const filteredTasks = tasks?.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) || [];
  const pendingTasks = filteredTasks.filter(t => !t.is_completed);
  const completedTasks = filteredTasks.filter(t => t.is_completed);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and goals</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />New Task</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="space-y-3 mt-4">
            {isLoading ? <p className="text-muted-foreground">Loading...</p> : pendingTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No pending tasks. Create one to get started!</p>
            ) : pendingTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedTasks.length === 0 ? <p className="text-muted-foreground text-center py-12">No completed tasks yet.</p>
              : completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
        </Tabs>
      </div>
      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppLayout>
  );
}
