import { Card, CardContent } from '@/components/ui/card';
import { ExceptionLog } from '@/hooks/useExceptions';
import { AlertTriangle, TrendingDown, Brain, CheckCircle } from 'lucide-react';

interface ExceptionStatsProps {
  exceptions: ExceptionLog[];
}

export function ExceptionStats({ exceptions }: ExceptionStatsProps) {
  const totalExceptions = exceptions.length;
  
  const genuineCount = exceptions.filter(e => e.was_genuine === true).length;
  const avoidableCount = exceptions.filter(e => e.was_genuine === false).length;
  
  // Find most common reason
  const reasonCounts = exceptions.reduce((acc, e) => {
    acc[e.reason_category] = (acc[e.reason_category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topReason = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])[0];

  const REASON_LABELS: Record<string, string> = {
    tired: 'Tired',
    phone_distraction: 'Phone',
    had_to_go_out: 'Going Out',
    emergency: 'Emergency',
    lazy: 'Lazy',
    sick: 'Sick',
    other: 'Other',
  };

  const stats = [
    {
      label: 'Total Exceptions',
      value: totalExceptions,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Genuine',
      value: genuineCount,
      icon: CheckCircle,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avoidable',
      value: avoidableCount,
      icon: TrendingDown,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Top Reason',
      value: topReason ? REASON_LABELS[topReason[0]] : '-',
      icon: Brain,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
