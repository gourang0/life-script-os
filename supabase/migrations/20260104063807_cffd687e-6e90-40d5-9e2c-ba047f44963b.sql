-- Add reminder_time column for scheduled notifications
ALTER TABLE public.reminders 
ADD COLUMN reminder_time timestamp with time zone DEFAULT NULL;