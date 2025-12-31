import { useEffect, useRef } from 'react';
import { useScheduleTemplates, useApplyTemplates } from './useScheduleTemplates';
import { useScheduleEntries } from './useScheduleEntries';
import { toast } from 'sonner';

const AUTO_APPLY_KEY = 'schedule_auto_apply_enabled';

export function useAutoApplyPreference() {
  const getPreference = () => {
    const stored = localStorage.getItem(AUTO_APPLY_KEY);
    return stored === 'true';
  };

  const setPreference = (enabled: boolean) => {
    localStorage.setItem(AUTO_APPLY_KEY, String(enabled));
  };

  return { getPreference, setPreference };
}

export function useAutoApplyTemplates(date: string, enabled: boolean) {
  const { data: templates = [] } = useScheduleTemplates();
  const { data: entries = [], isLoading: entriesLoading } = useScheduleEntries(date);
  const applyTemplates = useApplyTemplates();
  const appliedDatesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || entriesLoading || appliedDatesRef.current.has(date)) {
      return;
    }

    // Only auto-apply if there are no existing entries for the day
    if (entries.length === 0 && templates.length > 0) {
      appliedDatesRef.current.add(date);
      
      applyTemplates.mutateAsync({ templates, date }).then((result) => {
        if (result.applied > 0) {
          toast.success(`Auto-applied ${result.applied} template(s)`);
        }
      }).catch(() => {
        // Remove from applied set on error so it can retry
        appliedDatesRef.current.delete(date);
      });
    }
  }, [date, enabled, entries.length, entriesLoading, templates, applyTemplates]);
}
