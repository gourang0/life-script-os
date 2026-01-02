import { useState, useEffect } from 'react';
import { Plus, Utensils, Loader2, AlertCircle, Search } from 'lucide-react';
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
import { useCreateNutritionLog } from '@/hooks/useHealth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddNutritionDialogProps {
  selectedDate: string;
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

interface NutrientData {
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  fiber_grams: number;
  sugar_grams: number;
  sodium_mg: number;
  saturated_fat_grams: number;
  vitamin_a_iu: number;
  vitamin_c_mg: number;
  calcium_mg: number;
  iron_mg: number;
}

export function AddNutritionDialog({ selectedDate }: AddNutritionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutrients, setNutrients] = useState<NutrientData | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  const createLog = useCreateNutritionLog();

  // Auto-search when food name or quantity changes (with debounce)
  useEffect(() => {
    if (!foodName.trim()) {
      setNutrients(null);
      setProductName(null);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      lookupNutrition();
    }, 800);

    return () => clearTimeout(timer);
  }, [foodName, quantity]);

  const lookupNutrition = async () => {
    if (!foodName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // First try the food database
      const { data: dbData, error: dbError } = await supabase.functions.invoke('lookup-nutrition', {
        body: { query: foodName.trim(), quantity: parseInt(quantity) || 100 }
      });

      if (!dbError && dbData?.found) {
        setNutrients(dbData.nutrients);
        setProductName(dbData.product_name);
        return;
      }

      // If not found in database, use AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-nutrition', {
        body: { foodItems: `${quantity}g of ${foodName.trim()}` }
      });

      if (aiError) throw aiError;

      if (!aiData.identified) {
        setError('No food identified. Please check the food name.');
        setNutrients(null);
        setProductName(null);
        return;
      }

      setNutrients({
        calories: Math.round(aiData.calories || 0),
        protein_grams: Math.round((aiData.protein_grams || 0) * 10) / 10,
        carbs_grams: Math.round((aiData.carbs_grams || 0) * 10) / 10,
        fats_grams: Math.round((aiData.fats_grams || 0) * 10) / 10,
        fiber_grams: Math.round((aiData.fiber_grams || 0) * 10) / 10,
        sugar_grams: 0,
        sodium_mg: 0,
        saturated_fat_grams: 0,
        vitamin_a_iu: 0,
        vitamin_c_mg: 0,
        calcium_mg: 0,
        iron_mg: 0,
      });
      setProductName(foodName.trim());
    } catch (err) {
      console.error('Failed to lookup nutrition:', err);
      setError('Failed to find nutrition data. Please try again.');
      setNutrients(null);
      setProductName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    if (!nutrients) {
      toast.error('Please wait for nutrition data to load');
      return;
    }

    try {
      await createLog.mutateAsync({
        log_date: selectedDate,
        meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food_items: productName || foodName.trim(),
        calories: nutrients.calories,
        protein_grams: nutrients.protein_grams,
        carbs_grams: nutrients.carbs_grams,
        fats_grams: nutrients.fats_grams,
        fiber_grams: nutrients.fiber_grams,
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
    setFoodName('');
    setQuantity('100');
    setNotes('');
    setError(null);
    setNutrients(null);
    setProductName(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Log Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
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

          {/* Food Entry */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Food Name
            </Label>
            <div className="flex gap-2">
              <Input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., chicken breast, apple, rice..."
                className="flex-1"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20"
                  min="1"
                />
                <span className="text-sm text-muted-foreground">g</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter food name and quantity - nutrition is calculated automatically
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating nutrition...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {nutrients && productName && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{productName}</span>
                <span className="text-sm text-muted-foreground">{quantity}g</span>
              </div>
              
              {/* Main nutrients */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-background rounded-lg p-2">
                  <p className="text-lg font-bold text-orange-500">{nutrients.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="bg-background rounded-lg p-2">
                  <p className="text-lg font-bold text-red-400">{nutrients.protein_grams}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="bg-background rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">{nutrients.carbs_grams}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="bg-background rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-400">{nutrients.fats_grams}g</p>
                  <p className="text-xs text-muted-foreground">Fats</p>
                </div>
              </div>

              {/* Micronutrients */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Fiber</span>
                  <span className="font-medium">{nutrients.fiber_grams}g</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Sugar</span>
                  <span className="font-medium">{nutrients.sugar_grams}g</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Sodium</span>
                  <span className="font-medium">{nutrients.sodium_mg}mg</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Sat. Fat</span>
                  <span className="font-medium">{nutrients.saturated_fat_grams}g</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Calcium</span>
                  <span className="font-medium">{nutrients.calcium_mg}mg</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Iron</span>
                  <span className="font-medium">{nutrients.iron_mg}mg</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Vitamin A</span>
                  <span className="font-medium">{nutrients.vitamin_a_iu}IU</span>
                </div>
                <div className="flex justify-between p-1.5 bg-background rounded">
                  <span className="text-muted-foreground">Vitamin C</span>
                  <span className="font-medium">{nutrients.vitamin_c_mg}mg</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createLog.isPending || isLoading || !nutrients}
          >
            {createLog.isPending ? 'Logging...' : 'Log Meal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
