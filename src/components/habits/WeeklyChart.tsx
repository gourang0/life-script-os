import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WeeklyData {
  week: string;
  completed: number;
  total: number;
  percentage: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
}

export const WeeklyChart = ({ data }: WeeklyChartProps) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-md border border-border">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground">
        <TrendingUp className="w-5 h-5 text-primary" />
        Weekly Progress
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }} 
              className="fill-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="fill-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as WeeklyData;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                      <p className="font-medium text-foreground">{data.week}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.completed} / {data.total} completed
                      </p>
                      <p className="text-sm font-semibold text-primary">{data.percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  className="fill-primary"
                  opacity={0.7 + (entry.percentage / 100) * 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {data.map((week) => (
          <div key={week.week} className="flex justify-between text-muted-foreground">
            <span>{week.week}:</span>
            <span className="font-medium text-foreground">{week.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
