import { useState } from 'react';
import { Plus, Dumbbell } from 'lucide-react';
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
import { useCreateExerciseLog } from '@/hooks/useHealth';
import { toast } from 'sonner';

interface AddExerciseDialogProps {
  selectedDate: string;
}

const exerciseTypes = [
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'running', label: 'Running', icon: '🏃' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'gym', label: 'Gym Workout', icon: '🏋️' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'hiit', label: 'HIIT', icon: '💪' },
  { value: 'stretching', label: 'Stretching', icon: '🤸' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

export function AddExerciseDialog({ selectedDate }: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [exerciseType, setExerciseType] = useState('walking');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  const createLog = useCreateExerciseLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLog.mutateAsync({
        log_date: selectedDate,
        exercise_type: exerciseType,
        duration_minutes: duration ? parseInt(duration) : null,
        calories_burned: calories ? parseInt(calories) : null,
        steps: steps ? parseInt(steps) : null,
        distance_km: distance ? parseFloat(distance) : null,
        notes: notes.trim() || null,
      });
      
      toast.success('Exercise logged!');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to log exercise');
    }
  };

  const resetForm = () => {
    setExerciseType('walking');
    setDuration('');
    setCalories('');
    setSteps('');
    setDistance('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Log Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Log Exercise
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Exercise Type</Label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="minutes"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caloriesBurned">Calories Burned</Label>
              <Input
                id="caloriesBurned"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="steps"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="km"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseNotes">Notes (optional)</Label>
            <Input
              id="exerciseNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={createLog.isPending}>
            {createLog.isPending ? 'Logging...' : 'Log Exercise'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
