-- ============================================================
-- KARTAVYA DATABASE SCHEMA
-- Complete database structure with all tables and relationships
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- PROFILES TABLE
-- Stores user profile information, XP, streaks, and gamification data
-- Connected to: auth.users (via id)
CREATE TABLE public.profiles (
    id UUID NOT NULL PRIMARY KEY,  -- References auth.users(id)
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

-- USER ROLES TABLE
-- Stores user roles for access control
-- Connected to: auth.users (via user_id)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References auth.users(id)
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ============================================================
-- TASK & GOAL MANAGEMENT
-- ============================================================

-- GOALS TABLE
-- Stores user goals with progress tracking
-- Connected to: profiles (via user_id)
CREATE TABLE public.goals (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_date DATE,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GOAL PROGRESS HISTORY TABLE
-- Tracks historical progress of goals over time
-- Connected to: goals (via goal_id), profiles (via user_id)
CREATE TABLE public.goal_progress_history (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL,  -- References goals(id)
    user_id UUID NOT NULL,  -- References profiles(id)
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TASKS TABLE
-- Stores individual tasks with scheduling and XP rewards
-- Connected to: profiles (via user_id), goals (via goal_id)
CREATE TABLE public.tasks (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    goal_id UUID,           -- Optional: References goals(id)
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    difficulty INTEGER NOT NULL DEFAULT 3,
    due_date DATE,
    scheduled_date DATE,
    scheduled_start_time TIME WITHOUT TIME ZONE,
    scheduled_end_time TIME WITHOUT TIME ZONE,
    estimated_minutes INTEGER,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ROUTINES TABLE
-- Stores recurring activities/habits
-- Connected to: profiles (via user_id)
CREATE TABLE public.routines (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'lifestyle',
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE,
    duration_minutes INTEGER,
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
    is_flexible BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    xp_reward INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- SCHEDULING
-- ============================================================

-- SCHEDULE ENTRIES TABLE
-- Daily schedule with time blocks
-- Connected to: profiles (via user_id), tasks (via task_id), routines (via routine_id)
CREATE TABLE public.schedule_entries (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,   -- References profiles(id)
    task_id UUID,            -- Optional: References tasks(id)
    routine_id UUID,         -- Optional: References routines(id)
    title TEXT NOT NULL,
    entry_type TEXT NOT NULL DEFAULT 'task',
    entry_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SCHEDULE TEMPLATES TABLE
-- Reusable schedule templates
-- Connected to: profiles (via user_id)
CREATE TABLE public.schedule_templates (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    title TEXT NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- DAILY TRACKING
-- ============================================================

-- DAILY GOALS TABLE
-- Daily targets for steps, work, sleep
-- Connected to: profiles (via user_id)
CREATE TABLE public.daily_goals (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    steps_target INTEGER DEFAULT 10000,
    steps_actual INTEGER DEFAULT 0,
    work_hours_target NUMERIC DEFAULT 8,
    work_hours_actual NUMERIC DEFAULT 0,
    sleep_hours_target NUMERIC DEFAULT 8,
    sleep_hours_actual NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DAILY SUMMARIES TABLE
-- Aggregated daily statistics
-- Connected to: profiles (via user_id)
CREATE TABLE public.daily_summaries (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_scheduled INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    routines_scheduled INTEGER NOT NULL DEFAULT 0,
    routines_completed INTEGER NOT NULL DEFAULT 0,
    discipline_percentage NUMERIC NOT NULL DEFAULT 0,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    total_calories_in INTEGER,
    total_calories_out INTEGER,
    sleep_hours NUMERIC,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- HEALTH & WELLNESS
-- ============================================================

-- EXERCISE LOGS TABLE
-- Tracks exercise activities
-- Connected to: profiles (via user_id)
CREATE TABLE public.exercise_logs (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercise_type TEXT NOT NULL,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    distance_km NUMERIC,
    steps INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NUTRITION LOGS TABLE
-- Tracks meals and nutrition
-- Connected to: profiles (via user_id)
CREATE TABLE public.nutrition_logs (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL,
    food_items TEXT NOT NULL,
    calories INTEGER,
    protein_grams NUMERIC,
    carbs_grams NUMERIC,
    fats_grams NUMERIC,
    fiber_grams NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLEEP LOGS TABLE
-- Tracks sleep patterns
-- Connected to: profiles (via user_id)
CREATE TABLE public.sleep_logs (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_time TIME WITHOUT TIME ZONE,
    wake_time TIME WITHOUT TIME ZONE,
    duration_hours NUMERIC,
    quality TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- MEDITATION SESSIONS TABLE
-- Tracks meditation and mindfulness
-- Connected to: profiles (via user_id)
CREATE TABLE public.meditation_sessions (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_type TEXT NOT NULL DEFAULT 'meditation',
    duration_minutes INTEGER NOT NULL,
    is_guided BOOLEAN NOT NULL DEFAULT false,
    guide_topic TEXT,
    mood_before TEXT,
    mood_after TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- EXCEPTIONS & STREAK MANAGEMENT
-- ============================================================

-- EXCEPTION LOGS TABLE
-- Logs missed tasks/routines with reasons
-- Connected to: profiles (via user_id), tasks (via task_id), routines (via routine_id), schedule_entries (via schedule_entry_id)
CREATE TABLE public.exception_logs (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,       -- References profiles(id)
    task_id UUID,                -- Optional: References tasks(id)
    routine_id UUID,             -- Optional: References routines(id)
    schedule_entry_id UUID,      -- Optional: References schedule_entries(id)
    exception_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason_category TEXT NOT NULL,
    reason_details TEXT,
    mood TEXT,
    reflection_note TEXT,
    was_genuine BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- STREAK FREEZE LOGS TABLE
-- Records streak freeze usage
-- Connected to: profiles (via user_id), exception_logs (via exception_id)
CREATE TABLE public.streak_freeze_logs (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,   -- References profiles(id)
    exception_id UUID,       -- Optional: References exception_logs(id)
    freeze_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason_category TEXT NOT NULL,
    reason_details TEXT,
    was_genuine BOOLEAN,
    ai_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTES
-- ============================================================

-- NOTES TABLE
-- User notes with tags
-- Connected to: profiles (via user_id)
CREATE TABLE public.notes (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- References profiles(id)
    title TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- GAMIFICATION
-- ============================================================

-- BADGES TABLE
-- Available achievement badges (system-wide)
CREATE TABLE public.badges (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- USER BADGES TABLE
-- Badges earned by users
-- Connected to: profiles (via user_id), badges (via badge_id)
CREATE TABLE public.user_badges (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,   -- References profiles(id)
    badge_id UUID NOT NULL,  -- References badges(id)
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_id)
);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Create profile when new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RELATIONSHIP DIAGRAM (ASCII)
-- ============================================================
/*
                                    ┌─────────────────┐
                                    │   auth.users    │
                                    │  (Supabase)     │
                                    └────────┬────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   ▼
                ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                │    profiles     │ │   user_roles    │ │                 │
                │                 │ │                 │ │                 │
                │ - display_name  │ │ - role          │ │                 │
                │ - xp_points     │ │                 │ │                 │
                │ - level         │ └─────────────────┘ │                 │
                │ - streaks       │                     │                 │
                └────────┬────────┘                     │                 │
                         │                              │                 │
    ┌────────────────────┼────────────────────┬─────────┴────────┐       │
    │                    │                    │                  │       │
    ▼                    ▼                    ▼                  ▼       │
┌───────────┐      ┌───────────┐      ┌────────────┐      ┌───────────┐ │
│   tasks   │◄─────│   goals   │      │  routines  │      │   notes   │ │
│           │      │           │      │            │      │           │ │
│ - title   │      │ - title   │      │ - title    │      │ - content │ │
│ - priority│      │ - progress│      │ - days     │      │ - tags    │ │
│ - xp      │      │ - target  │      │ - time     │      │           │ │
└─────┬─────┘      └─────┬─────┘      └──────┬─────┘      └───────────┘ │
      │                  │                   │                          │
      │                  ▼                   │                          │
      │          ┌──────────────┐           │                          │
      │          │goal_progress │           │                          │
      │          │   _history   │           │                          │
      │          └──────────────┘           │                          │
      │                                     │                          │
      └──────────────────┬──────────────────┘                          │
                         │                                              │
                         ▼                                              │
                ┌─────────────────┐                                     │
                │schedule_entries │◄────────────────────────────────────┤
                │                 │                                     │
                │ - entry_date    │                                     │
                │ - start_time    │                                     │
                │ - is_completed  │                                     │
                └────────┬────────┘                                     │
                         │                                              │
    ┌────────────────────┼────────────────────┬─────────────────────────┘
    │                    │                    │
    ▼                    ▼                    ▼
┌───────────┐      ┌───────────┐      ┌────────────────┐
│exception  │      │ streak    │      │ daily_summaries│
│  _logs    │◄─────│freeze_logs│      │                │
│           │      │           │      │ - discipline % │
│ - reason  │      │ - freeze  │      │ - xp_earned    │
│ - mood    │      │ - ai_resp │      │ - calories     │
└───────────┘      └───────────┘      └────────────────┘

                    HEALTH TRACKING
    ┌────────────────────┬────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌───────────┐      ┌───────────┐      ┌───────────┐
│ exercise  │      │ nutrition │      │  sleep    │
│   _logs   │      │   _logs   │      │   _logs   │
└───────────┘      └───────────┘      └───────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   meditation    │
                │   _sessions     │
                └─────────────────┘

                    GAMIFICATION
    ┌─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌───────────┐                          ┌───────────┐
│  badges   │◄─────────────────────────│user_badges│
│ (system)  │                          │           │
└───────────┘                          └───────────┘
*/
