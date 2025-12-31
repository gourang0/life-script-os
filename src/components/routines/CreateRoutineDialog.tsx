import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateRoutine, useUpdateRoutine, Routine } from '@/hooks/useRoutines';
import { toast } from 'sonner';

interface CreateRoutineDialogProps {
  editingRoutine?: Routine | null;
  onClose?: () => void;
}

const categories = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'health', label: 'Health' },
  { value: 'study', label: 'Study' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' },
];

const daysOfWeek = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export function CreateRoutineDialog({ editingRoutine, onClose }: CreateRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('lifestyle');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [xpReward, setXpReward] = useState('5');

  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();

  const isEditing = !!editingRoutine;

  useEffect(() => {
    if (editingRoutine) {
      setOpen(true);
      setTitle(editingRoutine.title);
      setDescription(editingRoutine.description || '');
      setCategory(editingRoutine.category);
      setStartTime(editingRoutine.start_time);
      setEndTime(editingRoutine.end_time || '');
      setDurationMinutes(editingRoutine.duration_minutes?.toString() || '');
      setIsFlexible(editingRoutine.is_flexible);
      setSelectedDays(editingRoutine.days_of_week);
      setXpReward(editingRoutine.xp_reward.toString());
    }
  }, [editingRoutine]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    const routineData = {
      title: title.trim(),
      description: description.trim() || null,
      category: category as Routine['category'],
      start_time: startTime,
      end_time: endTime || null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      is_flexible: isFlexible,
      days_of_week: selectedDays,
      xp_reward: parseInt(xpReward) || 5,
      is_active: true,
    };

    try {
      if (isEditing) {
        await updateRoutine.mutateAsync({ id: editingRoutine.id, ...routineData });
        toast.success('Routine updated!');
      } else {
        await createRoutine.mutateAsync(routineData);
        toast.success('Routine created!');
      }
      handleOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update routine' : 'Failed to create routine');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('lifestyle');
    setStartTime('09:00');
    setEndTime('');
    setDurationMinutes('');
    setIsFlexible(false);
    setSelectedDays([1, 2, 3, 4, 5]);
    setXpReward('5');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Routine
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Routine' : 'Create Routine'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Workout"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this routine..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="endTime">End Time (optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes, if no end time)</Label>
            <Input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="flexible">Flexible Time</Label>
              <p className="text-xs text-muted-foreground">
                Can be done anytime during the day
              </p>
            </div>
            <Switch
              id="flexible"
              checked={isFlexible}
              onCheckedChange={setIsFlexible}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xp">XP Reward</Label>
            <Input
              id="xp"
              type="number"
              value={xpReward}
              onChange={(e) => setXpReward(e.target.value)}
              min="1"
              max="100"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createRoutine.isPending || updateRoutine.isPending}
          >
            {createRoutine.isPending || updateRoutine.isPending 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Routine' : 'Create Routine')
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
