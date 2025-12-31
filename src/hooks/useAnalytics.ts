import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailySummary {
  id: string;
  user_id: string;
  summary_date: string;
  tasks_scheduled: number;
  tasks_completed: number;
  routines_scheduled: number;
  routines_completed: number;
  discipline_percentage: number;
  total_xp_earned: number;
  total_calories_in: number | null;
  total_calories_out: number | null;
  sleep_hours: number | null;
  ai_feedback: string | null;
  created_at: string;
}

export function useDailySummaries(days: number = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily_summaries', user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .gte('summary_date', startDate.toISOString().split('T')[0])
        .order('summary_date', { ascending: true });
      
      if (error) throw error;
      return data as DailySummary[];
    },
    enabled: !!user,
  });
}

export function useExceptionAnalytics(days: number = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exception_analytics', user?.id, days],
    queryFn: async () => {
      if (!user) return [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('exception_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('exception_date', startDate.toISOString().split('T')[0])
        .order('exception_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
