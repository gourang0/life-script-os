import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateException } from '@/hooks/useExceptions';
import { useTasks } from '@/hooks/useTasks';
import { useRoutines } from '@/hooks/useRoutines';
import { toast } from 'sonner';
import { Plus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const REASON_CATEGORIES = [
  { value: 'tired', label: 'Tired / Low Energy' },
  { value: 'phone_distraction', label: 'Phone Distraction' },
  { value: 'had_to_go_out', label: 'Had to Go Out' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'lazy', label: 'Feeling Lazy' },
  { value: 'sick', label: 'Sick / Unwell' },
  { value: 'other', label: 'Other' },
];

const MOODS = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'frustrated', label: '😤 Frustrated' },
  { value: 'anxious', label: '😰 Anxious' },
];

interface AddExceptionDialogProps {
  selectedDate: string;
}

export function AddExceptionDialog({ selectedDate }: AddExceptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [reasonCategory, setReasonCategory] = useState<string>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [mood, setMood] = useState<string>('');
  const [wasGenuine, setWasGenuine] = useState(true);
  const [reflectionNote, setReflectionNote] = useState('');
  const [taskId, setTaskId] = useState<string>('');
  const [routineId, setRoutineId] = useState<string>('');

  const createException = useCreateException();
  const { data: tasks = [] } = useTasks(selectedDate);
  const { data: routines = [] } = useRoutines();

  const incompleteTasks = tasks.filter(t => !t.is_completed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reasonCategory) {
      toast.error('Please select a reason category');
      return;
    }

    try {
      await createException.mutateAsync({
        exception_date: selectedDate,
        reason_category: reasonCategory as any,
        reason_details: reasonDetails.trim() || null,
        mood: mood as any || null,
        was_genuine: wasGenuine,
        reflection_note: reflectionNote.trim() || null,
        task_id: taskId || null,
        routine_id: routineId || null,
        schedule_entry_id: null,
      });
      
      toast.success('Exception logged');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to log exception');
    }
  };

  const resetForm = () => {
    setReasonCategory('');
    setReasonDetails('');
    setMood('');
    setWasGenuine(true);
    setReflectionNote('');
    setTaskId('');
    setRoutineId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Log Exception
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Log Exception
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={format(new Date(selectedDate), 'MMMM d, yyyy')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Reason Category *</Label>
            <Select value={reasonCategory} onValueChange={setReasonCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Why did you miss it?" />
              </SelectTrigger>
              <SelectContent>
                {REASON_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Details (optional)</Label>
            <Textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="What happened?"
              maxLength={500}
            />
          </div>

          {incompleteTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Related Task (optional)</Label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {incompleteTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {routines.length > 0 && (
            <div className="space-y-2">
              <Label>Related Routine (optional)</Label>
              <Select value={routineId} onValueChange={setRoutineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select routine" />
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
            <Label>Current Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="was-genuine">Was this a genuine exception?</Label>
            <Switch
              id="was-genuine"
              checked={wasGenuine}
              onCheckedChange={setWasGenuine}
            />
          </div>

          <div className="space-y-2">
            <Label>Reflection Note</Label>
            <Textarea
              value={reflectionNote}
              onChange={(e) => setReflectionNote(e.target.value)}
              placeholder="What could you do differently next time?"
              maxLength={500}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createException.isPending}>
            {createException.isPending ? 'Logging...' : 'Log Exception'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
