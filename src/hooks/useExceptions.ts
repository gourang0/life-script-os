import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExceptionLog {
  id: string;
  user_id: string;
  task_id: string | null;
  routine_id: string | null;
  schedule_entry_id: string | null;
  exception_date: string;
  reason_category: 'tired' | 'phone_distraction' | 'had_to_go_out' | 'emergency' | 'lazy' | 'sick' | 'other';
  reason_details: string | null;
  mood: 'happy' | 'neutral' | 'sad' | 'frustrated' | 'anxious' | null;
  was_genuine: boolean | null;
  reflection_note: string | null;
  created_at: string;
}

export function useExceptions(date?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exceptions', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('exception_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (date) {
        query = query.eq('exception_date', date);
      } else {
        query = query.limit(50);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ExceptionLog[];
    },
    enabled: !!user,
  });
}

export function useCreateException() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (exception: Omit<ExceptionLog, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('exception_logs')
        .insert({ ...exception, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });
}

export function useUpdateException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExceptionLog> & { id: string }) => {
      const { data, error } = await supabase
        .from('exception_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });
}
