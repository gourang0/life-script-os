import { useState } from 'react';
import { Plus, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSleepLog } from '@/hooks/useHealth';
import { toast } from 'sonner';

interface AddSleepDialogProps {
  selectedDate: string;
}

const qualityOptions = [
  { value: 'excellent', label: 'Excellent', icon: '😴', color: 'text-green-500' },
  { value: 'good', label: 'Good', icon: '🙂', color: 'text-blue-500' },
  { value: 'fair', label: 'Fair', icon: '😐', color: 'text-yellow-500' },
  { value: 'poor', label: 'Poor', icon: '😫', color: 'text-red-500' },
];

export function AddSleepDialog({ selectedDate }: AddSleepDialogProps) {
  const [open, setOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [quality, setQuality] = useState<string>('good');
  const [notes, setNotes] = useState('');

  const createLog = useCreateSleepLog();

  const calculateDuration = () => {
    if (!sleepTime || !wakeTime) return null;
    const [sleepH, sleepM] = sleepTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let sleepMinutes = sleepH * 60 + sleepM;
    let wakeMinutes = wakeH * 60 + wakeM;
    
    // Handle overnight sleep
    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - sleepMinutes) / 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration = calculateDuration();

    try {
      await createLog.mutateAsync({
        log_date: selectedDate,
        sleep_time: sleepTime || null,
        wake_time: wakeTime || null,
        duration_hours: duration,
        quality: quality as 'poor' | 'fair' | 'good' | 'excellent' | null,
        notes: notes.trim() || null,
      });
      
      toast.success('Sleep logged!');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to log sleep');
    }
  };

  const resetForm = () => {
    setSleepTime('22:00');
    setWakeTime('06:00');
    setQuality('good');
    setNotes('');
  };

  const duration = calculateDuration();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Log Sleep
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Log Sleep
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sleepTime">Sleep Time</Label>
              <Input
                id="sleepTime"
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wakeTime">Wake Time</Label>
              <Input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
          </div>

          {duration !== null && (
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <span className="text-sm text-muted-foreground">Duration: </span>
              <span className="text-lg font-bold text-primary">
                {duration.toFixed(1)} hours
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Sleep Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>
                      {option.icon} {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sleepNotes">Notes (optional)</Label>
            <Input
              id="sleepNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Had trouble falling asleep..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={createLog.isPending}>
            {createLog.isPending ? 'Logging...' : 'Log Sleep'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
