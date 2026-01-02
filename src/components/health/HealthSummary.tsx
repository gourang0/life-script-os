import { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Equal, Target, Sparkles, Loader2, Settings } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Progress } from '@/components/ui/progress';

interface HealthSummaryProps {
  nutritionLogs: NutritionLog[];
  exerciseLogs: ExerciseLog[];
}

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise daily)' },
];

export function HealthSummary({ nutritionLogs, exerciseLogs }: HealthSummaryProps) {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [suggestedGoal, setSuggestedGoal] = useState<any>(null);

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

  const calculateGoalWithAI = async () => {
    if (!age || !weight || !height || !gender) {
      toast.error('Please fill in all profile fields');
      return;
    }

    setIsCalculating(true);
    setSuggestedGoal(null);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-calorie-goal', {
        body: {
          age: parseInt(age),
          weight_kg: parseFloat(weight),
          height_cm: parseFloat(height),
          gender,
          activity_level: activityLevel,
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuggestedGoal(data);
      toast.success('Calorie goal calculated!');
    } catch (error) {
      console.error('Failed to calculate goal:', error);
      toast.error('Failed to calculate goal');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveGoal = async () => {
    if (!suggestedGoal) return;

    try {
      await updateProfile.mutateAsync({
        calorie_goal: suggestedGoal.calorie_goal,
        activity_level: activityLevel,
        age: parseInt(age),
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        gender,
      } as any);
      
      toast.success('Calorie goal saved!');
      setGoalDialogOpen(false);
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const openGoalDialog = () => {
    // Pre-fill with existing profile data
    if (profile) {
      const p = profile as any;
      if (p.age) setAge(String(p.age));
      if (p.weight_kg) setWeight(String(p.weight_kg));
      if (p.height_cm) setHeight(String(p.height_cm));
      if (p.gender) setGender(p.gender);
      if (p.activity_level) setActivityLevel(p.activity_level);
    }
    setGoalDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Calorie Goal Card */}
      {calorieGoal ? (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Daily Calorie Goal</span>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={openGoalDialog}>
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <CalorieGoalDialogContent
                age={age} setAge={setAge}
                weight={weight} setWeight={setWeight}
                height={height} setHeight={setHeight}
                gender={gender} setGender={setGender}
                activityLevel={activityLevel} setActivityLevel={setActivityLevel}
                isCalculating={isCalculating}
                calculateGoalWithAI={calculateGoalWithAI}
                suggestedGoal={suggestedGoal}
                saveGoal={saveGoal}
                updateProfile={updateProfile}
              />
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
                : `${totalCaloriesIn - calorieGoal} kcal over goal`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                Set Your Calorie Goal
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Get AI-powered daily calorie recommendation based on your profile
              </p>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={openGoalDialog}>
                  <Sparkles className="w-4 h-4" />
                  Calculate
                </Button>
              </DialogTrigger>
              <CalorieGoalDialogContent
                age={age} setAge={setAge}
                weight={weight} setWeight={setWeight}
                height={height} setHeight={setHeight}
                gender={gender} setGender={setGender}
                activityLevel={activityLevel} setActivityLevel={setActivityLevel}
                isCalculating={isCalculating}
                calculateGoalWithAI={calculateGoalWithAI}
                suggestedGoal={suggestedGoal}
                saveGoal={saveGoal}
                updateProfile={updateProfile}
              />
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

// Extracted dialog content component
function CalorieGoalDialogContent({
  age, setAge,
  weight, setWeight,
  height, setHeight,
  gender, setGender,
  activityLevel, setActivityLevel,
  isCalculating,
  calculateGoalWithAI,
  suggestedGoal,
  saveGoal,
  updateProfile,
}: any) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Calorie Goal Calculator
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="10"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              min="20"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="175"
              min="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Activity Level</Label>
          <Select value={activityLevel} onValueChange={setActivityLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          className="w-full gap-2"
          onClick={calculateGoalWithAI}
          disabled={isCalculating || !age || !weight || !height || !gender}
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Calculate with AI
            </>
          )}
        </Button>

        {suggestedGoal && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
            <h4 className="font-semibold text-foreground">AI Recommendation</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Daily Calories</p>
                <p className="text-2xl font-bold text-primary">{suggestedGoal.calorie_goal}</p>
              </div>
              <div>
                <p className="text-muted-foreground">BMR</p>
                <p className="text-lg font-semibold text-foreground">{suggestedGoal.bmr}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Protein</p>
                <p className="font-medium text-red-400">{suggestedGoal.protein_goal_grams}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Carbs</p>
                <p className="font-medium text-yellow-400">{suggestedGoal.carbs_goal_grams}g</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fats</p>
                <p className="font-medium text-blue-400">{suggestedGoal.fats_goal_grams}g</p>
              </div>
            </div>
            {suggestedGoal.recommendation && (
              <p className="text-sm text-muted-foreground mt-2">{suggestedGoal.recommendation}</p>
            )}
            <Button 
              className="w-full mt-2" 
              onClick={saveGoal}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save as My Goal'}
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
