import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyGoal {
  id: string;
  user_id: string;
  goal_date: string;
  steps_target: number;
  steps_actual: number;
  work_hours_target: number;
  work_hours_actual: number;
  sleep_hours_target: number;
  sleep_hours_actual: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useDailyGoal(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_goal', user?.id, date],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', date)
        .maybeSingle();
      
      if (error) throw error;
      return data as DailyGoal | null;
    },
    enabled: !!user,
  });
}

export function useDailyGoals(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_goals', user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .gte('goal_date', startDate.toISOString().split('T')[0])
        .order('goal_date', { ascending: false });
      
      if (error) throw error;
      return data as DailyGoal[];
    },
    enabled: !!user,
  });
}

export function useUpsertDailyGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goal: Partial<DailyGoal> & { goal_date: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_goals')
        .upsert(
          { ...goal, user_id: user.id },
          { onConflict: 'user_id,goal_date' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_goal'] });
      queryClient.invalidateQueries({ queryKey: ['daily_goals'] });
    },
  });
}
