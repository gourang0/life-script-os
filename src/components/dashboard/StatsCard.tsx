import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatsCard({ title, value, icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      variant === 'primary' && "border-primary/50 bg-gradient-to-br from-card to-primary/10",
      variant === 'success' && "border-chart-3/50 bg-gradient-to-br from-card to-chart-3/10",
      variant === 'warning' && "border-chart-2/50 bg-gradient-to-br from-card to-chart-2/10"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm mt-2 font-medium",
                trend.isPositive ? "text-chart-3" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            variant === 'primary' && "bg-primary/20 text-primary",
            variant === 'success' && "bg-chart-3/20 text-chart-3",
            variant === 'warning' && "bg-chart-2/20 text-chart-2",
            variant === 'default' && "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
