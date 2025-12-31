import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExceptionLog } from '@/hooks/useExceptions';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const REASON_LABELS: Record<string, string> = {
  tired: 'Tired / Low Energy',
  phone_distraction: 'Phone Distraction',
  had_to_go_out: 'Had to Go Out',
  emergency: 'Emergency',
  lazy: 'Feeling Lazy',
  sick: 'Sick / Unwell',
  other: 'Other',
};

const MOOD_ICONS: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  frustrated: '😤',
  anxious: '😰',
};

interface ExceptionCardProps {
  exception: ExceptionLog;
  onDelete?: (id: string) => void;
}

export function ExceptionCard({ exception, onDelete }: ExceptionCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-destructive/10 rounded-lg shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  {REASON_LABELS[exception.reason_category] || exception.reason_category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(exception.exception_date), 'MMM d, yyyy')}
                </span>
                {exception.mood && (
                  <span className="text-sm">{MOOD_ICONS[exception.mood]}</span>
                )}
              </div>

              {exception.reason_details && (
                <p className="text-sm text-muted-foreground">
                  {exception.reason_details}
                </p>
              )}

              {exception.reflection_note && (
                <div className="bg-muted/50 p-2 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Reflection:</p>
                  <p className="text-sm">{exception.reflection_note}</p>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs">
                {exception.was_genuine !== null && (
                  <div className="flex items-center gap-1">
                    {exception.was_genuine ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Genuine exception</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">Could have been avoided</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onDelete(exception.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
