import { useGoals } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Timer, Skull, Target } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

export function UrgentGoalCountdown() {
  const { data: goals } = useGoals();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeGoals = goals?.filter(g => !g.is_completed && g.target_date) || [];
  
  const urgentGoal = activeGoals
    .map(g => ({ ...g, daysLeft: differenceInDays(parseISO(g.target_date!), now) }))
    .filter(g => g.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  if (!urgentGoal) return null;

  const targetDate = parseISO(urgentGoal.target_date!);
  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;
  const seconds = differenceInSeconds(targetDate, now) % 60;

  const getUrgencyStyle = () => {
    if (days === 0) return { 
      bg: 'bg-destructive/20 border-destructive', 
      icon: Skull, 
      text: 'text-destructive',
      message: '🔥 TODAY IS THE DAY! NO EXCUSES! 🔥'
    };
    if (days <= 2) return { 
      bg: 'bg-orange-500/20 border-orange-500', 
      icon: Flame, 
      text: 'text-orange-500',
      message: '⚠️ CRITICAL! TIME IS RUNNING OUT!'
    };
    if (days <= 7) return { 
      bg: 'bg-yellow-500/20 border-yellow-500', 
      icon: Timer, 
      text: 'text-yellow-500',
      message: '⏰ One week left! Stay focused!'
    };
    return { 
      bg: 'bg-primary/20 border-primary', 
      icon: Target, 
      text: 'text-primary',
      message: 'Keep pushing towards your goal!'
    };
  };

  const style = getUrgencyStyle();
  const Icon = style.icon;

  return (
    <Card className={`${style.bg} border-2 animate-pulse`}>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 ${style.text}`}>
          <Icon className="h-5 w-5" />
          Most Urgent Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold text-lg mb-2 truncate">{urgentGoal.title}</h3>
        <p className={`text-sm mb-3 ${style.text} font-medium`}>{style.message}</p>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Mins' },
            { value: seconds, label: 'Secs' },
          ].map((item) => (
            <div key={item.label} className="bg-background/50 rounded-lg p-2">
              <div className={`text-2xl font-bold ${style.text}`}>
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span className={style.text}>{urgentGoal.progress_percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${days <= 2 ? 'bg-destructive' : 'bg-primary'} transition-all`}
              style={{ width: `${urgentGoal.progress_percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
