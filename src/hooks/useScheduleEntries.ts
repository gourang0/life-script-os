import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScheduleEntry {
  id: string;
  user_id: string;
  title: string;
  entry_type: 'task' | 'routine' | 'custom';
  task_id: string | null;
  routine_id: string | null;
  entry_date: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useScheduleEntries(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['schedule_entries', user?.id, date],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', date)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ScheduleEntry[];
    },
    enabled: !!user,
  });
}

export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: Omit<ScheduleEntry, 'id' | 'user_id' | 'created_at' | 'completed_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('schedule_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_entries'] });
    },
  });
}

export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_entries'] });
    },
  });
}

export function useCompleteScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await supabase
        .from('schedule_entries')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', entryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_entries'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('schedule_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_entries'] });
    },
  });
}
