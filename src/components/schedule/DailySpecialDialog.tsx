import { useState } from 'react';
import { useCreateScheduleEntry } from '@/hooks/useScheduleEntries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailySpecialDialogProps {
  selectedDate: Date;
}

export function DailySpecialDialog({ selectedDate }: DailySpecialDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  const createEntry = useCreateScheduleEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your special task',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createEntry.mutateAsync({
        title: `⭐ ${title}`,
        entry_type: 'custom' as const,
        entry_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        is_completed: false,
        task_id: null,
        routine_id: null,
      });
      
      toast({
        title: 'Daily Special Added!',
        description: 'Your special task has been scheduled',
      });
      
      setTitle('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add special task',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Daily Special
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Daily Special
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={format(selectedDate, 'EEEE, MMMM d, yyyy')} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="special-title">What's special today?</Label>
            <Input
              id="special-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Birthday celebration, Important meeting..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Adding...' : 'Add Special Task'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
