-- Add unique constraint for upsert to work on daily_summaries
ALTER TABLE public.daily_summaries 
ADD CONSTRAINT daily_summaries_user_date_unique 
UNIQUE (user_id, summary_date);