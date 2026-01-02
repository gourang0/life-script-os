import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduleEntry } from './useScheduleEntries';

export function useMonthlyScheduleEntries(selectedMonth: Date) {
  const { user } = useAuth();
  const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['schedule_entries_monthly', user?.id, monthStart, monthEnd],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('schedule_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', monthStart)
        .lte('entry_date', monthEnd)
        .order('entry_date', { ascending: true });
      
      if (error) throw error;
      return data as ScheduleEntry[];
    },
    enabled: !!user,
  });
}
