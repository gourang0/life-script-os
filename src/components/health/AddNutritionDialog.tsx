import { useState } from 'react';
import { Plus, Utensils } from 'lucide-react';
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
import { useCreateNutritionLog } from '@/hooks/useHealth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddNutritionDialogProps {
  selectedDate: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

export function AddNutritionDialog({ selectedDate }: AddNutritionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [foodItems, setFoodItems] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [notes, setNotes] = useState('');

  const createLog = useCreateNutritionLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodItems.trim()) {
      toast.error('Please enter food items');
      return;
    }

    try {
      await createLog.mutateAsync({
        log_date: selectedDate,
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food_items: foodItems.trim(),
        calories: calories ? parseInt(calories) : null,
        protein_grams: protein ? parseFloat(protein) : null,
        carbs_grams: carbs ? parseFloat(carbs) : null,
        fats_grams: fats ? parseFloat(fats) : null,
        fiber_grams: fiber ? parseFloat(fiber) : null,
        notes: notes.trim() || null,
      });
      
      toast.success('Meal logged!');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to log meal');
    }
  };

  const resetForm = () => {
    setMealType('breakfast');
    setFoodItems('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setFiber('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Log Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Log Nutrition
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((meal) => (
                  <SelectItem key={meal.value} value={meal.value}>
                    {meal.icon} {meal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodItems">Food Items</Label>
            <Textarea
              id="foodItems"
              value={foodItems}
              onChange={(e) => setFoodItems(e.target.value)}
              placeholder="e.g., 2 eggs, toast, orange juice..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="grams"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="grams"
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                placeholder="grams"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiber">Fiber (g)</Label>
            <Input
              id="fiber"
              type="number"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              placeholder="grams"
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={createLog.isPending}>
            {createLog.isPending ? 'Logging...' : 'Log Meal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
