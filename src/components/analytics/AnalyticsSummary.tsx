import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, AlertTriangle, Zap } from 'lucide-react';
import { DailySummary } from '@/hooks/useAnalytics';

interface AnalyticsSummaryProps {
  summaries: DailySummary[];
  exceptionCount: number;
}

export function AnalyticsSummary({ summaries, exceptionCount }: AnalyticsSummaryProps) {
  const avgDiscipline = summaries.length > 0 
    ? Math.round(summaries.reduce((sum, d) => sum + d.discipline_percentage, 0) / summaries.length)
    : 0;

  const totalTasks = summaries.reduce((sum, d) => sum + d.tasks_completed, 0);
  const totalXP = summaries.reduce((sum, d) => sum + d.total_xp_earned, 0);

  const stats = [
    {
      label: 'Avg Discipline',
      value: `${avgDiscipline}%`,
      icon: Target,
      trend: avgDiscipline >= 80 ? 'positive' : avgDiscipline >= 60 ? 'neutral' : 'negative',
    },
    {
      label: 'Tasks Completed',
      value: totalTasks,
      icon: TrendingUp,
      trend: 'positive',
    },
    {
      label: 'Exceptions',
      value: exceptionCount,
      icon: AlertTriangle,
      trend: exceptionCount > 10 ? 'negative' : exceptionCount > 5 ? 'neutral' : 'positive',
    },
    {
      label: 'XP Earned',
      value: `+${totalXP}`,
      icon: Zap,
      trend: 'positive',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                stat.trend === 'positive' ? 'bg-primary/10' :
                stat.trend === 'negative' ? 'bg-destructive/10' : 'bg-muted'
              }`}>
                <stat.icon className={`h-4 w-4 ${
                  stat.trend === 'positive' ? 'text-primary' :
                  stat.trend === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
