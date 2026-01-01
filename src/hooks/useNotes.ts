import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const NOTE_TAG_COLORS: Record<string, string> = {
  work: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  personal: 'bg-green-500/20 text-green-600 dark:text-green-400',
  ideas: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  important: 'bg-red-500/20 text-red-600 dark:text-red-400',
  learning: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  health: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
  finance: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  reminder: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
};

export const AVAILABLE_TAGS = Object.keys(NOTE_TAG_COLORS);

export function useNotes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (note: { title?: string; content: string; tags?: string[] }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...note, user_id: user.id, tags: note.tags || [] })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
