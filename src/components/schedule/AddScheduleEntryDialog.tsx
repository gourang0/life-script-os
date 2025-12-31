import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { useCreateScheduleEntry } from '@/hooks/useScheduleEntries';
import { useTasks } from '@/hooks/useTasks';
import { useRoutines } from '@/hooks/useRoutines';
import { toast } from 'sonner';

interface AddScheduleEntryDialogProps {
  selectedDate: string;
}

export function AddScheduleEntryDialog({ selectedDate }: AddScheduleEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [entryType, setEntryType] = useState<'task' | 'routine' | 'custom'>('custom');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [linkedRoutineId, setLinkedRoutineId] = useState<string>('');

  const createEntry = useCreateScheduleEntry();
  const { data: tasks } = useTasks();
  const { data: routines } = useRoutines();

  const unscheduledTasks = tasks?.filter(t => !t.is_completed && !t.scheduled_date) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        entry_type: entryType,
        task_id: entryType === 'task' && linkedTaskId ? linkedTaskId : null,
        routine_id: entryType === 'routine' && linkedRoutineId ? linkedRoutineId : null,
        entry_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        is_completed: false,
      });
      
      toast.success('Schedule entry added!');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add entry');
    }
  };

  const resetForm = () => {
    setTitle('');
    setEntryType('custom');
    setStartTime('09:00');
    setEndTime('10:00');
    setLinkedTaskId('');
    setLinkedRoutineId('');
  };

  const handleTaskSelect = (taskId: string) => {
    setLinkedTaskId(taskId);
    const task = unscheduledTasks.find(t => t.id === taskId);
    if (task) {
      setTitle(task.title);
    }
  };

  const handleRoutineSelect = (routineId: string) => {
    setLinkedRoutineId(routineId);
    const routine = routines?.find(r => r.id === routineId);
    if (routine) {
      setTitle(routine.title);
      setStartTime(routine.start_time);
      if (routine.end_time) {
        setEndTime(routine.end_time);
      } else if (routine.duration_minutes) {
        const [h, m] = routine.start_time.split(':').map(Number);
        const totalMinutes = h * 60 + m + routine.duration_minutes;
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Schedule Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryType">Entry Type</Label>
            <Select value={entryType} onValueChange={(v) => setEntryType(v as typeof entryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Block</SelectItem>
                <SelectItem value="task">Link Task</SelectItem>
                <SelectItem value="routine">Link Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entryType === 'task' && unscheduledTasks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="linkedTask">Select Task</Label>
              <Select value={linkedTaskId} onValueChange={handleTaskSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task..." />
                </SelectTrigger>
                <SelectContent>
                  {unscheduledTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {entryType === 'routine' && routines && routines.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="linkedRoutine">Select Routine</Label>
              <Select value={linkedRoutineId} onValueChange={handleRoutineSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a routine..." />
                </SelectTrigger>
                <SelectContent>
                  {routines.map((routine) => (
                    <SelectItem key={routine.id} value={routine.id}>
                      {routine.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you scheduling?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Adding...' : 'Add to Schedule'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
