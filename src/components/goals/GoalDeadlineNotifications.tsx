import { useGoals } from '@/hooks/useGoals';
import { differenceInDays, format } from 'date-fns';
import { AlertTriangle, Clock, Flame, Skull, Timer, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Notification {
  goalId: string;
  title: string;
  daysLeft: number;
  targetDate: string;
  urgency: 'critical' | 'urgent' | 'warning' | 'approaching';
}

const getUrgencyConfig = (urgency: Notification['urgency']) => {
  switch (urgency) {
    case 'critical':
      return {
        icon: Skull,
        bgClass: 'bg-destructive/20 border-destructive animate-pulse',
        textClass: 'text-destructive',
        message: '💀 DEADLINE TODAY! NO EXCUSES!',
      };
    case 'urgent':
      return {
        icon: Flame,
        bgClass: 'bg-orange-500/20 border-orange-500',
        textClass: 'text-orange-500',
        message: '🔥 TIME IS RUNNING OUT!',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bgClass: 'bg-yellow-500/20 border-yellow-500',
        textClass: 'text-yellow-500',
        message: '⚡ DEADLINE APPROACHING FAST!',
      };
    case 'approaching':
      return {
        icon: Timer,
        bgClass: 'bg-primary/20 border-primary',
        textClass: 'text-primary',
        message: '⏰ Stay focused, deadline ahead!',
      };
  }
};

const getDramaticMessage = (daysLeft: number, title: string) => {
  if (daysLeft === 0) {
    return `"${title}" - THE MOMENT OF TRUTH HAS ARRIVED! TODAY OR NEVER!`;
  } else if (daysLeft === 1) {
    return `"${title}" - ONLY 24 HOURS LEFT! WILL YOU RISE OR FALL?`;
  } else if (daysLeft <= 3) {
    return `"${title}" - ${daysLeft} DAYS! THE CLOCK IS TICKING MERCILESSLY!`;
  } else if (daysLeft <= 7) {
    return `"${title}" - ${daysLeft} days remaining. Victory awaits the disciplined!`;
  } else {
    return `"${title}" - ${daysLeft} days to prove yourself. Don't waste a single one!`;
  }
};

export function GoalDeadlineNotifications() {
  const { data: goals } = useGoals();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  const notifications: Notification[] = (goals ?? [])
    .filter((goal) => !goal.is_completed && goal.target_date)
    .map((goal) => {
      const daysLeft = differenceInDays(new Date(goal.target_date!), new Date());
      let urgency: Notification['urgency'];
      
      if (daysLeft <= 0) urgency = 'critical';
      else if (daysLeft <= 2) urgency = 'urgent';
      else if (daysLeft <= 7) urgency = 'warning';
      else if (daysLeft <= 14) urgency = 'approaching';
      else return null;

      return {
        goalId: goal.id,
        title: goal.title,
        daysLeft: Math.max(0, daysLeft),
        targetDate: goal.target_date!,
        urgency,
      };
    })
    .filter((n): n is Notification => n !== null && !dismissedIds.has(n.goalId))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleDismiss = (goalId: string) => {
    setDismissedIds((prev) => new Set([...prev, goalId]));
  };

  if (notifications.length === 0 || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.slice(0, 3).map((notification) => {
        const config = getUrgencyConfig(notification.urgency);
        const Icon = config.icon;

        return (
          <div
            key={notification.goalId}
            className={cn(
              'rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm transition-all duration-300',
              config.bgClass
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5', config.textClass)}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <p className={cn('text-xs font-bold uppercase tracking-wider', config.textClass)}>
                  {config.message}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {getDramaticMessage(notification.daysLeft, notification.title)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Deadline: {format(new Date(notification.targetDate), 'MMM d, yyyy')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => handleDismiss(notification.goalId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
      {notifications.length > 3 && (
        <p className="text-center text-xs text-muted-foreground">
          +{notifications.length - 3} more deadline{notifications.length - 3 > 1 ? 's' : ''} lurking...
        </p>
      )}
    </div>
  );
}
