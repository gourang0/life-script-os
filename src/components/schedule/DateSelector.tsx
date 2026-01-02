import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday, isFuture, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  allowFuture?: boolean;
}

export function DateSelector({ selectedDate, onDateChange, allowFuture = false }: DateSelectorProps) {
  const today = startOfDay(new Date());
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE');
  };

  const canGoForward = allowFuture || !isToday(selectedDate);

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    if (allowFuture || !isFuture(nextDay)) {
      onDateChange(nextDay);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (!allowFuture && isFuture(startOfDay(date))) {
      return; // Don't allow future dates
    }
    onDateChange(date);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDateChange(subDays(selectedDate, 1))}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-start gap-2">
            <CalendarDays className="w-4 h-4" />
            <span className="font-semibold">{getDateLabel(selectedDate)}</span>
            <span className="text-muted-foreground">
              {format(selectedDate, 'MMM d, yyyy')}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={allowFuture ? undefined : { after: today }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        disabled={!canGoForward}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {!isToday(selectedDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(new Date())}
        >
          Today
        </Button>
      )}
    </div>
  );
}
