-- Add calorie goal and activity level fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS calorie_goal integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS activity_level text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS age integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS height_cm numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gender text DEFAULT NULL;