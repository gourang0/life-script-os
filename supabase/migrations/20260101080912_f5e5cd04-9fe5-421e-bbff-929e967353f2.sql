-- Add tags column to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create goal_progress_history table for tracking progress over time
CREATE TABLE IF NOT EXISTS public.goal_progress_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goal_progress_history
ALTER TABLE public.goal_progress_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for goal_progress_history
CREATE POLICY "Users can view their own goal progress history"
ON public.goal_progress_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal progress history"
ON public.goal_progress_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal progress history"
ON public.goal_progress_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_goal_progress_history_goal_id ON public.goal_progress_history(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_history_recorded_at ON public.goal_progress_history(recorded_at);