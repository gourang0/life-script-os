import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScheduleTemplate {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useScheduleTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['schedule_templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('schedule_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ScheduleTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateScheduleTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<ScheduleTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('schedule_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_templates'] });
    },
  });
}

export function useUpdateScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduleTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_templates'] });
    },
  });
}

export function useDeleteScheduleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('schedule_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_templates'] });
    },
  });
}

export function useApplyTemplates() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ templates, date }: { templates: ScheduleTemplate[]; date: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const dayOfWeek = new Date(date).getDay() || 7; // Convert Sunday (0) to 7
      
      const applicableTemplates = templates.filter(
        t => t.is_active && t.days_of_week.includes(dayOfWeek)
      );

      if (applicableTemplates.length === 0) {
        return { applied: 0 };
      }

      const entries = applicableTemplates.map(template => ({
        user_id: user.id,
        title: template.title,
        entry_type: 'custom',
        entry_date: date,
        start_time: template.start_time,
        end_time: template.end_time,
        is_completed: false,
      }));

      const { error } = await supabase
        .from('schedule_entries')
        .insert(entries);

      if (error) throw error;
      return { applied: entries.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_entries'] });
    },
  });
}
