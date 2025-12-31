import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend } from 'recharts';

interface ExceptionPatternsChartProps {
  data: Array<{ reason_category: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  tired: 'Tired',
  phone_distraction: 'Phone Distraction',
  had_to_go_out: 'Had to Go Out',
  emergency: 'Emergency',
  lazy: 'Lazy',
  sick: 'Sick',
  other: 'Other',
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(var(--muted))',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
];

export function ExceptionPatternsChart({ data }: ExceptionPatternsChartProps) {
  // Count exceptions by category
  const categoryCounts = data.reduce((acc, item) => {
    const category = item.reason_category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
    name: CATEGORY_LABELS[category] || category,
    value: count,
  }));

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Exception Patterns</span>
          <span className="text-sm font-normal text-muted-foreground">
            {data.length} total
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No exceptions logged yet
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
