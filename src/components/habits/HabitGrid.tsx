import { Habit } from '@/types/habit';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash2, Lock, Printer } from 'lucide-react';

interface HabitGridProps {
  habits: Habit[];
  daysInMonth: number;
  onToggle: (habitId: string, day: number) => void;
  onDelete: (habitId: string) => void;
}

export const HabitGrid = ({ habits, daysInMonth, onToggle, onDelete }: HabitGridProps) => {
  const weeks = Math.ceil(daysInMonth / 7);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isFutureDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(currentYear, currentMonth, currentDay);
    return checkDate > todayDate;
  };

  const getWeekDays = (weekIndex: number) => {
    const start = weekIndex * 7;
    return days.slice(start, start + 7);
  };

  const handlePrint = () => {
    window.print();
  };

  // Empty rows for print version
  const emptyPrintRows = 5;

  return (
    <>
      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            .print-tick-circle {
              width: 16px;
              height: 16px;
              border: 2px solid #333;
              border-radius: 50%;
              display: inline-block;
            }
          }
        `}
      </style>
      
      <div className="bg-card rounded-lg p-6 shadow-md border border-border print:shadow-none print:border-0 print-container">
        {/* Print header - Name line */}
        <div className="hidden print:block mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold text-lg">Name:</span>
            <div className="flex-1 border-b-2 border-foreground min-h-[24px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Month:</span>
            <div className="w-48 border-b-2 border-foreground min-h-[24px]" />
            <span className="font-semibold text-lg ml-8">Year:</span>
            <div className="w-32 border-b-2 border-foreground min-h-[24px]" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 no-print">
          <h3 className="font-semibold text-xl text-foreground">Daily Habits</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
        
        {/* Screen version title */}
        <h3 className="hidden print:block font-bold text-xl text-center mb-4">Daily Habit Tracker</h3>
        
        <div className="w-full overflow-x-auto scrollbar-thin print:overflow-visible">
          <table className="w-full border-collapse print:text-sm" style={{ minWidth: `${300 + weeks * 180}px` }}>
            <thead>
              {/* Week headers row */}
              <tr className="bg-primary/20 print:bg-gray-100">
                <th className="border border-border p-3 print:p-2 text-left font-semibold text-sm text-foreground w-[200px] min-w-[200px] print:w-[120px] print:min-w-[120px]">
                  DAILY HABITS
                </th>
                <th className="border border-border p-3 print:p-2 text-center font-semibold text-sm text-foreground w-[80px] min-w-[80px] print:w-[50px] print:min-w-[50px]">
                  GOAL
                </th>
                {Array.from({ length: weeks }, (_, i) => (
                  <th key={i} className="border border-border p-0 text-center font-semibold text-sm text-foreground print:text-xs" style={{ minWidth: '180px' }}>
                    <div className="p-2 print:p-1 border-b border-border">WEEK {i + 1}</div>
                    <div className="grid grid-cols-7">
                      {dayNames.map((name, j) => (
                        <div key={j} className="py-1 px-1 print:px-0 border-r border-border last:border-r-0">
                          <span className="text-xs text-muted-foreground block print:text-[10px]">{name}</span>
                          <span className="text-xs text-foreground font-medium print:text-[10px]">
                            {i * 7 + j + 1 <= daysInMonth ? i * 7 + j + 1 : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="border border-border p-3 print:p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl flex-shrink-0 print:text-base">{habit.emoji}</span>
                      <span className="text-sm font-medium text-foreground truncate print:text-xs">{habit.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 no-print"
                        onClick={() => onDelete(habit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="border border-border p-3 print:p-2 text-center text-sm font-semibold text-muted-foreground print:text-xs">
                    {habit.goal}
                  </td>
                  {Array.from({ length: weeks }, (_, weekIndex) => (
                    <td key={weekIndex} className="border border-border p-0">
                      <div className="grid grid-cols-7">
                        {getWeekDays(weekIndex).map((day) => {
                          const isCompleted = habit.completedDays.includes(day);
                          const isFuture = isFutureDate(day);
                          return (
                            <div 
                              key={day} 
                              className={cn(
                                "flex items-center justify-center p-2 print:p-1 border-r border-border last:border-r-0 min-h-[44px] print:min-h-[24px]",
                                isFuture && "bg-muted/50 print:bg-transparent"
                              )}
                            >
                              {/* Screen version */}
                              <div className="print:hidden">
                                {isFuture ? (
                                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                                ) : (
                                  <Checkbox
                                    checked={isCompleted}
                                    onCheckedChange={() => onToggle(habit.id, day)}
                                    className={cn(
                                      "w-5 h-5 rounded-sm border-2 transition-all",
                                      isCompleted 
                                        ? "bg-primary border-primary data-[state=checked]:bg-primary" 
                                        : "border-muted-foreground/40 bg-background"
                                    )}
                                  />
                                )}
                              </div>
                              {/* Print version - empty tick circle */}
                              <div className="hidden print:block">
                                <span className="print-tick-circle" />
                              </div>
                            </div>
                          );
                        })}
                        {/* Fill empty days */}
                        {weekIndex === weeks - 1 && 
                          Array.from({ length: 7 - getWeekDays(weekIndex).length }, (_, i) => (
                            <div key={`empty-${i}`} className="border-r border-border last:border-r-0 min-h-[44px] print:min-h-[24px]" />
                          ))
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Print-only empty rows for manual habit entry */}
              {[...Array(emptyPrintRows)].map((_, rowIndex) => (
                <tr key={`empty-row-${rowIndex}`} className="hidden print:table-row">
                  <td className="border border-border p-2">
                    <div className="min-h-[20px]" />
                  </td>
                  <td className="border border-border p-2 text-center">
                    <div className="min-h-[20px]" />
                  </td>
                  {Array.from({ length: weeks }, (_, weekIndex) => (
                    <td key={weekIndex} className="border border-border p-0">
                      <div className="grid grid-cols-7">
                        {Array.from({ length: 7 }, (_, dayIndex) => {
                          const dayNum = weekIndex * 7 + dayIndex + 1;
                          if (dayNum > daysInMonth) {
                            return <div key={dayIndex} className="border-r border-border last:border-r-0 min-h-[24px]" />;
                          }
                          return (
                            <div key={dayIndex} className="flex items-center justify-center p-1 border-r border-border last:border-r-0 min-h-[24px]">
                              <span className="print-tick-circle" />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Print-only section for goals/memo */}
        <div className="hidden print:block mt-8 pt-4">
          <h4 className="font-bold text-lg mb-4 border-b-2 border-foreground pb-2">Goals / Memo</h4>
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-b border-gray-400 h-6" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
