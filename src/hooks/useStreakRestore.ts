import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, parseISO } from 'date-fns';

const MAX_STREAK_FREEZES = 3;
const CONSECUTIVE_DAYS_FOR_RESTORE = 5;

export function useStreakRestoreEligibility() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['streak_restore_eligibility', user?.id],
    queryFn: async () => {
      if (!user) return { eligible: false, consecutiveDays: 0, canRestore: false };
      
      // Get profile to check current freeze count
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_freeze_count')
        .eq('id', user.id)
        .single();
      
      if (!profile) return { eligible: false, consecutiveDays: 0, canRestore: false };
      
      // Already at max, no need to restore
      if (profile.streak_freeze_count >= MAX_STREAK_FREEZES) {
        return { eligible: false, consecutiveDays: 0, canRestore: false, atMax: true };
      }
      
      // Check the last 5 days for completed schedule entries
      const today = new Date();
      const consecutiveDays: boolean[] = [];
      
      for (let i = 0; i < CONSECUTIVE_DAYS_FOR_RESTORE; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        
        const { data: entries } = await supabase
          .from('schedule_entries')
          .select('id, is_completed')
          .eq('user_id', user.id)
          .eq('entry_date', date);
        
        // A day counts as "worked" if there are entries and at least 80% are completed
        if (entries && entries.length > 0) {
          const completedCount = entries.filter(e => e.is_completed).length;
          const completionRate = completedCount / entries.length;
          consecutiveDays.push(completionRate >= 0.8);
        } else {
          consecutiveDays.push(false);
        }
      }
      
      // Count consecutive days from today backwards
      let count = 0;
      for (const worked of consecutiveDays) {
        if (worked) {
          count++;
        } else {
          break;
        }
      }
      
      return {
        eligible: count >= CONSECUTIVE_DAYS_FOR_RESTORE,
        consecutiveDays: count,
        canRestore: count >= CONSECUTIVE_DAYS_FOR_RESTORE && profile.streak_freeze_count < MAX_STREAK_FREEZES,
        currentFreezes: profile.streak_freeze_count,
        maxFreezes: MAX_STREAK_FREEZES,
      };
    },
    enabled: !!user,
  });
}

export function useRestoreStreakFreeze() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Get current freeze count
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_freeze_count')
        .eq('id', user.id)
        .single();
      
      if (!profile) throw new Error('Profile not found');
      
      if (profile.streak_freeze_count >= MAX_STREAK_FREEZES) {
        throw new Error('Already at maximum streak freezes');
      }
      
      // Increment freeze count (max 3)
      const newCount = Math.min(profile.streak_freeze_count + 1, MAX_STREAK_FREEZES);
      
      const { error } = await supabase
        .from('profiles')
        .update({ streak_freeze_count: newCount })
        .eq('id', user.id);
      
      if (error) throw error;
      
      return { newCount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['streak_restore_eligibility'] });
    },
  });
}
