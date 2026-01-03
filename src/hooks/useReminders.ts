import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reminder {
  id: string;
  user_id: string;
  content: string;
  priority: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useReminders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!user,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reminder: { content: string; priority: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('reminders')
        .insert({ ...reminder, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reminder> & { id: string }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
