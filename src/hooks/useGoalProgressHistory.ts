import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GoalProgressHistory {
  id: string;
  goal_id: string;
  user_id: string;
  progress_percentage: number;
  recorded_at: string;
}

export function useGoalProgressHistory(goalId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goal_progress_history', goalId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goal_progress_history')
        .select('*')
        .eq('goal_id', goalId)
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      return data as GoalProgressHistory[];
    },
    enabled: !!user && !!goalId,
  });
}

export function useRecordGoalProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('goal_progress_history')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          progress_percentage: progress,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goal_progress_history', goalId] });
    },
  });
}
