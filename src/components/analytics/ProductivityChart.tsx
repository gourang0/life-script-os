import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailySummary } from '@/hooks/useAnalytics';

interface ProductivityChartProps {
  data: DailySummary[];
}

const chartConfig = {
  tasks: {
    label: 'Tasks Completed',
    color: 'hsl(var(--primary))',
  },
  routines: {
    label: 'Routines Completed',
    color: 'hsl(var(--secondary))',
  },
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.summary_date), 'MMM d'),
    tasks: item.tasks_completed,
    routines: item.routines_completed,
  }));

  const totalTasks = data.reduce((sum, d) => sum + d.tasks_completed, 0);
  const totalRoutines = data.reduce((sum, d) => sum + d.routines_completed, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Productivity</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalTasks} tasks, {totalRoutines} routines
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
            <BarChart data={chartData}>
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
              <Bar 
                dataKey="tasks" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="routines" 
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
