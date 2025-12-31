import { Flame, TrendingUp, TrendingDown, Equal } from 'lucide-react';
import { NutritionLog, ExerciseLog } from '@/hooks/useHealth';

interface HealthSummaryProps {
  nutritionLogs: NutritionLog[];
  exerciseLogs: ExerciseLog[];
}

export function HealthSummary({ nutritionLogs, exerciseLogs }: HealthSummaryProps) {
  // Calculate totals
  const totalCaloriesIn = nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = nutritionLogs.reduce((sum, log) => sum + (log.protein_grams || 0), 0);
  const totalCarbs = nutritionLogs.reduce((sum, log) => sum + (log.carbs_grams || 0), 0);
  const totalFats = nutritionLogs.reduce((sum, log) => sum + (log.fats_grams || 0), 0);
  
  const totalCaloriesOut = exerciseLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const totalSteps = exerciseLogs.reduce((sum, log) => sum + (log.steps || 0), 0);
  const totalExerciseMinutes = exerciseLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

  const calorieBalance = totalCaloriesIn - totalCaloriesOut;
  const BalanceIcon = calorieBalance > 0 ? TrendingUp : calorieBalance < 0 ? TrendingDown : Equal;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Calories In */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium">Calories In</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalCaloriesIn}</p>
        <p className="text-xs text-muted-foreground">kcal consumed</p>
      </div>

      {/* Calories Out */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Flame className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium">Calories Out</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalCaloriesOut}</p>
        <p className="text-xs text-muted-foreground">kcal burned</p>
      </div>

      {/* Balance */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <BalanceIcon className={`w-4 h-4 ${calorieBalance > 0 ? 'text-red-500' : calorieBalance < 0 ? 'text-green-500' : 'text-blue-500'}`} />
          <span className="text-xs font-medium">Balance</span>
        </div>
        <p className={`text-2xl font-bold ${calorieBalance > 0 ? 'text-red-400' : calorieBalance < 0 ? 'text-green-400' : 'text-foreground'}`}>
          {calorieBalance > 0 ? '+' : ''}{calorieBalance}
        </p>
        <p className="text-xs text-muted-foreground">net calories</p>
      </div>

      {/* Exercise */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <span className="text-sm">💪</span>
          <span className="text-xs font-medium">Activity</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{totalExerciseMinutes}</p>
        <p className="text-xs text-muted-foreground">min exercise</p>
      </div>

      {/* Macros */}
      <div className="col-span-2 md:col-span-4 bg-card border border-border rounded-xl p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Macronutrients</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">{totalProtein.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{totalCarbs.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-400">{totalFats.toFixed(0)}g</p>
            <p className="text-xs text-muted-foreground">Fats</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      {totalSteps > 0 && (
        <div className="col-span-2 md:col-span-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Steps</p>
              <p className="text-3xl font-bold text-foreground">{totalSteps.toLocaleString()}</p>
            </div>
            <span className="text-4xl">👟</span>
          </div>
        </div>
      )}
    </div>
  );
}
