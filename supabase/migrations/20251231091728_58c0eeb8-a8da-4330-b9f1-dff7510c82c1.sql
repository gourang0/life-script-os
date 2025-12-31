-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    xp_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    streak_freeze_count INTEGER NOT NULL DEFAULT 3,
    total_tasks_completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATE,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
    estimated_minutes INTEGER,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    scheduled_date DATE,
    scheduled_start_time TIME,
    scheduled_end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routines table
CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'lifestyle' CHECK (category IN ('lifestyle', 'health', 'study', 'work', 'other')),
    start_time TIME NOT NULL,
    end_time TIME,
    duration_minutes INTEGER,
    is_flexible BOOLEAN NOT NULL DEFAULT false,
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
    xp_reward INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule_entries table (for daily schedule blocks)
CREATE TABLE public.schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    title TEXT NOT NULL,
    entry_type TEXT NOT NULL DEFAULT 'task' CHECK (entry_type IN ('task', 'routine', 'break')),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exception_logs table
CREATE TABLE public.exception_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    schedule_entry_id UUID REFERENCES public.schedule_entries(id) ON DELETE SET NULL,
    exception_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason_category TEXT NOT NULL CHECK (reason_category IN ('tired', 'phone_distraction', 'had_to_go_out', 'emergency', 'lazy', 'sick', 'other')),
    reason_details TEXT,
    mood TEXT CHECK (mood IN ('happy', 'neutral', 'sad', 'frustrated', 'anxious')),
    was_genuine BOOLEAN,
    reflection_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    xp_reward INTEGER NOT NULL DEFAULT 50,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_id)
);

-- Create nutrition_logs table
CREATE TABLE public.nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_items TEXT NOT NULL,
    calories INTEGER,
    protein_grams DECIMAL(6,2),
    carbs_grams DECIMAL(6,2),
    fats_grams DECIMAL(6,2),
    fiber_grams DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise_logs table
CREATE TABLE public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_type TEXT NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    steps INTEGER,
    distance_km DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sleep_logs table
CREATE TABLE public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_time TIME,
    wake_time TIME,
    duration_hours DECIMAL(4,2),
    quality TEXT CHECK (quality IN ('poor', 'fair', 'good', 'excellent')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_summaries table
CREATE TABLE public.daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_scheduled INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    routines_scheduled INTEGER NOT NULL DEFAULT 0,
    routines_completed INTEGER NOT NULL DEFAULT 0,
    discipline_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    total_calories_in INTEGER,
    total_calories_out INTEGER,
    sleep_hours DECIMAL(4,2),
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, summary_date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exception_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for routines
CREATE POLICY "Users can view their own routines" ON public.routines
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON public.routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON public.routines
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON public.routines
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for schedule_entries
CREATE POLICY "Users can view their own schedule entries" ON public.schedule_entries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedule entries" ON public.schedule_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedule entries" ON public.schedule_entries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedule entries" ON public.schedule_entries
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exception_logs
CREATE POLICY "Users can view their own exceptions" ON public.exception_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exceptions" ON public.exception_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exceptions" ON public.exception_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exceptions" ON public.exception_logs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for badges (public read, admin write)
CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for nutrition_logs
CREATE POLICY "Users can view their own nutrition logs" ON public.nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own nutrition logs" ON public.nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own nutrition logs" ON public.nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own nutrition logs" ON public.nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs
CREATE POLICY "Users can view their own exercise logs" ON public.exercise_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exercise logs" ON public.exercise_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exercise logs" ON public.exercise_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exercise logs" ON public.exercise_logs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sleep_logs
CREATE POLICY "Users can view their own sleep logs" ON public.sleep_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sleep logs" ON public.sleep_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sleep logs" ON public.sleep_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sleep logs" ON public.sleep_logs
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_summaries
CREATE POLICY "Users can view their own summaries" ON public.daily_summaries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own summaries" ON public.daily_summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own summaries" ON public.daily_summaries
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, xp_reward, requirement_type, requirement_value) VALUES
('First Blood', 'Complete your first task', '🎯', 'tasks', 25, 'tasks_completed', 1),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streaks', 100, 'streak_days', 7),
('Century', 'Complete 100 tasks', '💯', 'tasks', 250, 'tasks_completed', 100),
('No Excuses', 'Zero exceptions in a week', '💪', 'discipline', 150, 'exception_free_days', 7),
('Early Riser', 'Wake up on time for 7 consecutive days', '🌅', 'lifestyle', 100, 'early_rise_streak', 7),
('Health Nut', 'Log nutrition for 30 days', '🥗', 'health', 200, 'nutrition_logs', 30),
('Streak Master', 'Reach a 30-day streak', '⚡', 'streaks', 300, 'streak_days', 30),
('Goal Crusher', 'Complete your first goal', '🏆', 'goals', 100, 'goals_completed', 1),
('Level 5', 'Reach level 5', '⭐', 'levels', 150, 'level', 5),
('Level 10', 'Reach level 10', '🌟', 'levels', 300, 'level', 10);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_scheduled_date ON public.tasks(scheduled_date);
CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_schedule_entries_user_date ON public.schedule_entries(user_id, entry_date);
CREATE INDEX idx_exception_logs_user_date ON public.exception_logs(user_id, exception_date);
CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, log_date);
CREATE INDEX idx_exercise_logs_user_date ON public.exercise_logs(user_id, log_date);
CREATE INDEX idx_daily_summaries_user_date ON public.daily_summaries(user_id, summary_date);