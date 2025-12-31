import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailySummary } from '@/hooks/useAnalytics';

interface DisciplineChartProps {
  data: DailySummary[];
}

const chartConfig = {
  discipline: {
    label: 'Discipline %',
    color: 'hsl(var(--primary))',
  },
};

export function DisciplineChart({ data }: DisciplineChartProps) {
  const chartData = data.map((item) => ({
    date: format(parseISO(item.summary_date), 'MMM d'),
    discipline: item.discipline_percentage,
  }));

  const avgDiscipline = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.discipline_percentage, 0) / data.length)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Discipline Trend</span>
          <span className="text-sm font-normal text-muted-foreground">
            Avg: {avgDiscipline}%
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
            <LineChart data={chartData}>
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="discipline" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
