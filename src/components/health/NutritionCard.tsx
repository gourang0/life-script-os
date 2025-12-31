import { Utensils, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { NutritionLog } from '@/hooks/useHealth';
import { cn } from '@/lib/utils';

interface NutritionCardProps {
  log: NutritionLog;
}

const mealIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export function NutritionCard({ log }: NutritionCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{mealIcons[log.meal_type]}</span>
            <span className="text-sm font-medium capitalize text-foreground">
              {log.meal_type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {log.food_items}
          </p>
          
          <div className="flex flex-wrap gap-3 text-xs">
            {log.calories && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-3 h-3" />
                <span>{log.calories} kcal</span>
              </div>
            )}
            {log.protein_grams && (
              <div className="flex items-center gap-1 text-red-400">
                <Beef className="w-3 h-3" />
                <span>{log.protein_grams}g protein</span>
              </div>
            )}
            {log.carbs_grams && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Wheat className="w-3 h-3" />
                <span>{log.carbs_grams}g carbs</span>
              </div>
            )}
            {log.fats_grams && (
              <div className="flex items-center gap-1 text-blue-400">
                <Droplets className="w-3 h-3" />
                <span>{log.fats_grams}g fats</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
