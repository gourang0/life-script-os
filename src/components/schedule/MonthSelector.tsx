import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const goToPreviousMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };

  const goToCurrentMonth = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold text-foreground">
          {format(selectedMonth, 'MMMM yyyy')}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          className="h-9"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
