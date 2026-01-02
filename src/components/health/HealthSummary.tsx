import { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Equal, Target, Settings, Save } from 'lucide-react';
import { NutritionLog, ExerciseLog } from '@/hooks/useHealth';
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
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Progress } from '@/components/ui/progress';

interface HealthSummaryProps {
  nutritionLogs: NutritionLog[];
  exerciseLogs: ExerciseLog[];
}

export function HealthSummary({ nutritionLogs, exerciseLogs }: HealthSummaryProps) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState('');

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

  // Get calorie goal from profile
  const calorieGoal = (profile as any)?.calorie_goal || null;
  const calorieProgress = calorieGoal ? Math.min((totalCaloriesIn / calorieGoal) * 100, 100) : 0;

  const openGoalDialog = () => {
    if (calorieGoal) {
      setCalorieTarget(String(calorieGoal));
    }
    setGoalDialogOpen(true);
  };

  const saveCalorieGoal = async () => {
    const target = parseInt(calorieTarget);
    if (!target || target < 500 || target > 10000) {
      toast.error('Please enter a valid calorie target (500-10000)');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        calorie_goal: target,
      } as any);
      
      toast.success('Calorie target saved!');
      setGoalDialogOpen(false);
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save calorie target');
    }
  };

  return (
    <div className="space-y-4">
      {/* Calorie Goal Card */}
      {calorieGoal ? (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Daily Calorie Target</span>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={openGoalDialog}>
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Set Calorie Target
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calorieTarget">Daily Calorie Limit (kcal)</Label>
                    <Input
                      id="calorieTarget"
                      type="number"
                      value={calorieTarget}
                      onChange={(e) => setCalorieTarget(e.target.value)}
                      placeholder="e.g., 2000"
                      min="500"
                      max="10000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1500-2500 kcal for most adults
                    </p>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    onClick={saveCalorieGoal}
                    disabled={updateProfile.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Target'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{totalCaloriesIn} / {calorieGoal} kcal</span>
              <span className="font-medium text-foreground">{Math.round(calorieProgress)}%</span>
            </div>
            <Progress value={calorieProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {calorieGoal - totalCaloriesIn > 0 
                ? `${calorieGoal - totalCaloriesIn} kcal remaining`
                : `${totalCaloriesIn - calorieGoal} kcal over target`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Set Your Calorie Target
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your daily calorie limit to track progress
              </p>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={openGoalDialog}>
                  <Target className="w-4 h-4" />
                  Set Target
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Set Calorie Target
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calorieTarget">Daily Calorie Limit (kcal)</Label>
                    <Input
                      id="calorieTarget"
                      type="number"
                      value={calorieTarget}
                      onChange={(e) => setCalorieTarget(e.target.value)}
                      placeholder="e.g., 2000"
                      min="500"
                      max="10000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1500-2500 kcal for most adults
                    </p>
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    onClick={saveCalorieGoal}
                    disabled={updateProfile.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Target'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Stats Grid */}
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
    </div>
  );
}
