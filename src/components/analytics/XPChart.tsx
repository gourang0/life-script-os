import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailySummary } from '@/hooks/useAnalytics';
import { Zap } from 'lucide-react';

interface XPChartProps {
  data: DailySummary[];
}

const chartConfig = {
  xp: {
    label: 'XP Earned',
    color: 'hsl(var(--primary))',
  },
};

export function XPChart({ data }: XPChartProps) {
  let cumulativeXP = 0;
  const chartData = data.map((item) => {
    cumulativeXP += item.total_xp_earned;
    return {
      date: format(parseISO(item.summary_date), 'MMM d'),
      xp: cumulativeXP,
      daily: item.total_xp_earned,
    };
  });

  const totalXP = data.reduce((sum, d) => sum + d.total_xp_earned, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            XP Progress
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            +{totalXP} XP this period
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
