import { useState } from 'react';
import { Plus, Utensils, Sparkles, Loader2, AlertCircle, Search } from 'lucide-react';
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

export function AddNutritionDialog({ selectedDate }: AddNutritionDialogProps) {
  const [open, setOpen] = useState(false);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [foodItems, setFoodItems] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<string | null>(null);

  const createLog = useCreateNutritionLog();

  const searchFoodDatabase = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a food to search');
      return;
    }

    setIsSearching(true);
    setAnalysisError(null);
    setFoundProduct(null);

    try {
      const { data, error } = await supabase.functions.invoke('lookup-nutrition', {
        body: { query: searchQuery.trim(), quantity: parseInt(quantity) || 100 }
      });

      if (error) throw error;

      if (!data.found) {
        setAnalysisError(data.message || 'No food found. Try "Calculate with AI" instead.');
        toast.error('No food found');
        return;
      }

      // Populate fields with found data
      setFoodItems(data.product_name + (data.brand ? ` (${data.brand})` : ''));
      setFoundProduct(data.product_name);
      
      const n = data.nutrients;
      if (n.calories) setCalories(String(n.calories));
      if (n.protein_grams) setProtein(String(n.protein_grams));
      if (n.carbs_grams) setCarbs(String(n.carbs_grams));
      if (n.fats_grams) setFats(String(n.fats_grams));
      if (n.fiber_grams) setFiber(String(n.fiber_grams));
      if (n.sugar_grams) setSugar(String(n.sugar_grams));
      if (n.sodium_mg) setSodium(String(n.sodium_mg));

      toast.success(`Found: ${data.product_name}`);
    } catch (error) {
      console.error('Failed to search food:', error);
      setAnalysisError('Search failed. Try "Calculate with AI" instead.');
      toast.error('Failed to search food database');
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!foodItems.trim()) {
      toast.error('Please enter food items first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-nutrition', {
        body: { foodItems: foodItems.trim() }
      });

      if (error) throw error;

      if (!data.identified) {
        setAnalysisError('No food identified. Please enter valid food items.');
        toast.error('No food identified');
        return;
      }

      if (data.calories) setCalories(String(Math.round(data.calories)));
      if (data.protein_grams) setProtein(String(Math.round(data.protein_grams * 10) / 10));
      if (data.carbs_grams) setCarbs(String(Math.round(data.carbs_grams * 10) / 10));
      if (data.fats_grams) setFats(String(Math.round(data.fats_grams * 10) / 10));
      if (data.fiber_grams) setFiber(String(Math.round(data.fiber_grams * 10) / 10));
      if (data.analysis) setAiAnalysis(data.analysis);

      toast.success('Nutrition calculated!');
    } catch (error) {
      console.error('Failed to analyze nutrition:', error);
      setAnalysisError('Failed to analyze. Please try again or enter values manually.');
      toast.error('Failed to analyze nutrition');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    setSearchQuery('');
    setQuantity('100');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setFiber('');
    setSugar('');
    setSodium('');
    setNotes('');
    setAnalysisError(null);
    setAiAnalysis(null);
    setFoundProduct(null);
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

          {/* Food Database Search */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Search className="w-4 h-4" />
              Search Food Database
            </Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., chicken breast, apple..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchFoodDatabase())}
              />
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="g"
                className="w-20"
                min="1"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full gap-2"
              onClick={searchFoodDatabase}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search & Auto-Fill ({quantity}g)
                </>
              )}
            </Button>
          </div>

          {foundProduct && (
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600 dark:text-green-400">
              ✓ Found: {foundProduct} - nutrients auto-filled!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="foodItems">Food Items</Label>
            <Textarea
              id="foodItems"
              value={foodItems}
              onChange={(e) => {
                setFoodItems(e.target.value);
                setAnalysisError(null);
              }}
              placeholder="e.g., 2 eggs, toast, orange juice..."
              rows={2}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={analyzeWithAI}
              disabled={isAnalyzing || !foodItems.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Calculate with AI
                </>
              )}
            </Button>
          </div>

          {analysisError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {analysisError}
            </div>
          )}

          {aiAnalysis && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-foreground">
              <div className="flex items-center gap-2 mb-1 font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Analysis
              </div>
              <p className="text-muted-foreground">{aiAnalysis}</p>
            </div>
          )}

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
              <Label htmlFor="sugar">Sugar (g)</Label>
              <Input
                id="sugar"
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="grams"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sodium">Sodium (mg)</Label>
            <Input
              id="sodium"
              type="number"
              value={sodium}
              onChange={(e) => setSodium(e.target.value)}
              placeholder="mg"
              min="0"
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
