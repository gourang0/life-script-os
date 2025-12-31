import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGoal, useUpdateGoal, Goal } from '@/hooks/useGoals';
import { toast } from 'sonner';
import { Plus, Target } from 'lucide-react';
import { format, addMonths } from 'date-fns';

const CATEGORIES = [
  { value: 'health', label: 'Health & Fitness' },
  { value: 'career', label: 'Career & Work' },
  { value: 'learning', label: 'Learning & Growth' },
  { value: 'finance', label: 'Finance' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' },
];

interface CreateGoalDialogProps {
  goal?: Goal;
  trigger?: React.ReactNode;
}

export function CreateGoalDialog({ goal, trigger }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [category, setCategory] = useState(goal?.category || '');
  const [targetDate, setTargetDate] = useState(
    goal?.target_date || format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  );

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const isEditing = !!goal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    try {
      if (isEditing) {
        await updateGoal.mutateAsync({
          id: goal.id,
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
          target_date: targetDate || null,
        });
        toast.success('Goal updated');
      } else {
        await createGoal.mutateAsync({
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
          target_date: targetDate || null,
        });
        toast.success('Goal created');
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update goal' : 'Failed to create goal');
    }
  };

  const resetForm = () => {
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setCategory('');
      setTargetDate(format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>What do you want to achieve? *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Run a marathon, Learn Spanish..."
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal in detail..."
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createGoal.isPending || updateGoal.isPending}
          >
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
