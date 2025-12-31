import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StreakFreezeLog {
  id: string;
  user_id: string;
  freeze_date: string;
  exception_id: string | null;
  reason_category: string;
  reason_details: string | null;
  was_genuine: boolean | null;
  ai_response: string | null;
  created_at: string;
}

export function useStreakFreezeLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streak_freeze_logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('streak_freeze_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('freeze_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as StreakFreezeLog[];
    },
    enabled: !!user,
  });
}

export function useStreakFreezeForDate(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streak_freeze', user?.id, date],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('streak_freeze_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('freeze_date', date)
        .maybeSingle();
      
      if (error) throw error;
      return data as StreakFreezeLog | null;
    },
    enabled: !!user,
  });
}

export function useCreateStreakFreeze() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (freezeData: {
      freeze_date: string;
      reason_category: string;
      reason_details?: string;
      was_genuine: boolean;
      exception_id?: string;
      ai_response?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // First, check if user has freezes available
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_freeze_count')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.streak_freeze_count <= 0) {
        throw new Error('No streak freezes available');
      }
      
      // Create the freeze log
      const { data, error } = await supabase
        .from('streak_freeze_logs')
        .insert({ ...freezeData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Decrement the freeze count
      await supabase
        .from('profiles')
        .update({ streak_freeze_count: profile.streak_freeze_count - 1 })
        .eq('id', user.id);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak_freeze_logs'] });
      queryClient.invalidateQueries({ queryKey: ['streak_freeze'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
