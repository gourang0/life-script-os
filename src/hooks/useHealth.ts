import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: string;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fats_grams: number | null;
  fiber_grams: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  log_date: string;
  exercise_type: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  steps: number | null;
  distance_km: number | null;
  notes: string | null;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_time: string | null;
  wake_time: string | null;
  duration_hours: number | null;
  quality: 'poor' | 'fair' | 'good' | 'excellent' | null;
  notes: string | null;
  created_at: string;
}

export function useNutritionLogs(date?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nutrition', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('log_date', date);
      } else {
        query = query.limit(50);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as NutritionLog[];
    },
    enabled: !!user,
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (log: Omit<NutritionLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({ ...log, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });
}

export function useExerciseLogs(date?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exercise', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('log_date', date);
      } else {
        query = query.limit(50);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ExerciseLog[];
    },
    enabled: !!user,
  });
}

export function useCreateExerciseLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (log: Omit<ExerciseLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({ ...log, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise'] });
    },
  });
}

export function useSleepLogs(date?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sleep', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false });
      
      if (date) {
        query = query.eq('log_date', date);
      } else {
        query = query.limit(30);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SleepLog[];
    },
    enabled: !!user,
  });
}

export function useCreateSleepLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (log: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('sleep_logs')
        .insert({ ...log, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sleep'] });
    },
  });
}
