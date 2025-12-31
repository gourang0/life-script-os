-- Create daily_goals table for tracking steps, work hours, sleep targets
CREATE TABLE public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps_target INTEGER DEFAULT 10000,
  steps_actual INTEGER DEFAULT 0,
  work_hours_target NUMERIC(4,2) DEFAULT 8,
  work_hours_actual NUMERIC(4,2) DEFAULT 0,
  sleep_hours_target NUMERIC(4,2) DEFAULT 8,
  sleep_hours_actual NUMERIC(4,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

-- Create streak_freeze_logs to track when freezes are used
CREATE TABLE public.streak_freeze_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  freeze_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exception_id UUID REFERENCES public.exception_logs(id) ON DELETE SET NULL,
  reason_category TEXT NOT NULL,
  reason_details TEXT,
  was_genuine BOOLEAN,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, freeze_date)
);

-- Enable RLS
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_goals
CREATE POLICY "Users can view their own daily goals" ON public.daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily goals" ON public.daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily goals" ON public.daily_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily goals" ON public.daily_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for streak_freeze_logs
CREATE POLICY "Users can view their own streak freeze logs" ON public.streak_freeze_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streak freeze logs" ON public.streak_freeze_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak freeze logs" ON public.streak_freeze_logs FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for updated_at on daily_goals
CREATE TRIGGER update_daily_goals_updated_at
  BEFORE UPDATE ON public.daily_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();