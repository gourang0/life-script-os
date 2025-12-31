import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp_points: number;
  level: number;
  current_streak: number;
  best_streak: number;
  streak_freeze_count: number;
  total_tasks_completed: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useAddXP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (xpAmount: number) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp_points, level')
        .eq('id', user.id)
        .single();
      
      if (!profile) throw new Error('Profile not found');
      
      const newXP = profile.xp_points + xpAmount;
      const xpPerLevel = 100;
      const newLevel = Math.floor(newXP / xpPerLevel) + 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          xp_points: newXP,
          level: newLevel
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, leveledUp: newLevel > profile.level };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
