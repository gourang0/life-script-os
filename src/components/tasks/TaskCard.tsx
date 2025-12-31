import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Clock, 
  Zap, 
  Trash2, 
  Edit,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Task, useCompleteTask, useDeleteTask } from '@/hooks/useTasks';
import { useAddXP } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onLogException?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onLogException }: TaskCardProps) {
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const addXP = useAddXP();
  const [completing, setCompleting] = useState(false);

  const priorityColors = {
    low: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
    medium: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    high: 'bg-destructive/20 text-destructive border-destructive/30'
  };

  const handleComplete = async () => {
    if (completing || task.is_completed) return;
    setCompleting(true);

    try {
      await completeTask.mutateAsync(task.id);
      const { leveledUp } = await addXP.mutateAsync(task.xp_reward);
      
      toast({
        title: `+${task.xp_reward} XP! 🎉`,
        description: leveledUp 
          ? "Congratulations! You leveled up!" 
          : `Task "${task.title}" completed!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been removed.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      task.is_completed && "opacity-60 bg-muted/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={task.is_completed}
            onCheckedChange={handleComplete}
            disabled={completing || task.is_completed}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium text-foreground",
                  task.is_completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {!task.is_completed && onLogException && (
                    <DropdownMenuItem onClick={() => onLogException(task)}>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Log Exception
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              
              {task.estimated_minutes && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimated_minutes}m
                </Badge>
              )}
              
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/30">
                <Zap className="w-3 h-3" />
                {task.xp_reward} XP
              </Badge>

              {task.due_date && (
                <Badge variant="outline" className="text-muted-foreground">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
