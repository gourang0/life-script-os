import { useState } from 'react';
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
import { Plus } from 'lucide-react';

interface AddHabitDialogProps {
  onAdd: (name: string, emoji: string, goal: number) => void;
}

const EMOJI_OPTIONS = ['🎯', '💪', '📚', '🧘', '💧', '🏃', '🎨', '🎵', '💤', '🥗', '✍️', '🌟'];

export const AddHabitDialog = ({ onAdd }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [goal, setGoal] = useState(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), emoji, goal);
      setName('');
      setEmoji('🎯');
      setGoal(30);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning jog"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                    emoji === e
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Monthly Goal (days)</Label>
            <Input
              id="goal"
              type="number"
              min={1}
              max={31}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
