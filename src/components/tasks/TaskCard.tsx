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
  AlertCircle,
  Sparkles,
  PartyPopper
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
  const [showCelebration, setShowCelebration] = useState(false);

  const priorityColors = {
    low: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
    medium: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
    high: 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse'
  };

  const handleComplete = async () => {
    if (completing || task.is_completed) return;
    setCompleting(true);

    try {
      await completeTask.mutateAsync(task.id);
      const { leveledUp } = await addXP.mutateAsync(task.xp_reward);
      
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
      
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
    <Card 
      variant={task.is_completed ? "default" : "interactive"}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        task.is_completed && "opacity-60 bg-muted/30",
        showCelebration && "animate-bounce-in border-primary glow-md"
      )}
    >
      {/* XP glow effect on completion */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-2/20 to-chart-3/20 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
          {[...Array(6)].map((_, i) => (
            <PartyPopper
              key={i}
              className="absolute text-yellow-500 animate-confetti h-4 w-4"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: '50%',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Priority indicator bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all",
        task.priority === 'high' && "bg-destructive",
        task.priority === 'medium' && "bg-chart-2",
        task.priority === 'low' && "bg-chart-3",
      )} />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start gap-4">
          <Checkbox
            variant="animated"
            checked={task.is_completed}
            onCheckedChange={handleComplete}
            disabled={completing || task.is_completed}
            className={cn(
              "mt-1 transition-all",
              completing && "animate-pulse"
            )}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium text-foreground transition-all duration-300",
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-primary/10 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {!task.is_completed && onLogException && (
                    <DropdownMenuItem onClick={() => onLogException(task)} className="cursor-pointer">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Log Exception
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="outline" className={cn(priorityColors[task.priority], "capitalize")}>
                {task.priority}
              </Badge>
              
              {task.estimated_minutes && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimated_minutes}m
                </Badge>
              )}
              
              <Badge variant="glow" className="gap-1">
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