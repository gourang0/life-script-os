import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleEntry {
  id: string;
  user_id: string;
  is_completed: boolean;
  entry_type: string;
}

interface SummaryData {
  user_id: string;
  summary_date: string;
  tasks_scheduled: number;
  tasks_completed: number;
  routines_scheduled: number;
  routines_completed: number;
  discipline_percentage: number;
  total_xp_earned: number;
  total_calories_in: number | null;
  total_calories_out: number | null;
  sleep_hours: number | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get date from request or default to yesterday
    const body = await req.json().catch(() => ({}));
    const targetDate = body.date || getYesterdayDate();
    
    console.log(`Generating daily summaries for date: ${targetDate}`);

    // Get all users who have schedule entries for this date
    const { data: entries, error: entriesError } = await supabase
      .from('schedule_entries')
      .select('id, user_id, is_completed, entry_type')
      .eq('entry_date', targetDate);

    if (entriesError) {
      console.error('Error fetching schedule entries:', entriesError);
      throw entriesError;
    }

    console.log(`Found ${entries?.length || 0} schedule entries`);

    // Group entries by user
    const userEntries = (entries || []).reduce((acc, entry) => {
      if (!acc[entry.user_id]) {
        acc[entry.user_id] = [];
      }
      acc[entry.user_id].push(entry);
      return acc;
    }, {} as Record<string, ScheduleEntry[]>);

    const userIds = Object.keys(userEntries);
    console.log(`Processing ${userIds.length} users`);

    // Process each user
    const summaries: SummaryData[] = [];

    for (const userId of userIds) {
      const userSchedule = userEntries[userId];
      
      // Calculate task stats
      const taskEntries = userSchedule.filter(e => e.entry_type === 'task' || e.entry_type === 'custom');
      const routineEntries = userSchedule.filter(e => e.entry_type === 'routine');
      
      const tasksScheduled = taskEntries.length;
      const tasksCompleted = taskEntries.filter(e => e.is_completed).length;
      const routinesScheduled = routineEntries.length;
      const routinesCompleted = routineEntries.filter(e => e.is_completed).length;
      
      // Calculate discipline percentage
      const totalScheduled = tasksScheduled + routinesScheduled;
      const totalCompleted = tasksCompleted + routinesCompleted;
      const disciplinePercentage = totalScheduled > 0 
        ? Math.round((totalCompleted / totalScheduled) * 100) 
        : 0;

      // Get nutrition data for the day
      const { data: nutritionLogs } = await supabase
        .from('nutrition_logs')
        .select('calories')
        .eq('user_id', userId)
        .eq('log_date', targetDate);

      const totalCaloriesIn = nutritionLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || null;

      // Get exercise data for the day
      const { data: exerciseLogs } = await supabase
        .from('exercise_logs')
        .select('calories_burned')
        .eq('user_id', userId)
        .eq('log_date', targetDate);

      const totalCaloriesOut = exerciseLogs?.reduce((sum, log) => sum + (log.calories_burned || 0), 0) || null;

      // Get sleep data for the day
      const { data: sleepLogs } = await supabase
        .from('sleep_logs')
        .select('duration_hours')
        .eq('user_id', userId)
        .eq('log_date', targetDate)
        .limit(1);

      const sleepHours = sleepLogs?.[0]?.duration_hours || null;

      // Calculate XP earned from completed schedule entries
      const totalXpEarned = (tasksCompleted * 10) + (routinesCompleted * 5);

      summaries.push({
        user_id: userId,
        summary_date: targetDate,
        tasks_scheduled: tasksScheduled,
        tasks_completed: tasksCompleted,
        routines_scheduled: routinesScheduled,
        routines_completed: routinesCompleted,
        discipline_percentage: disciplinePercentage,
        total_xp_earned: totalXpEarned,
        total_calories_in: totalCaloriesIn,
        total_calories_out: totalCaloriesOut,
        sleep_hours: sleepHours,
      });
    }

    // Upsert summaries (update if exists, insert if not)
    if (summaries.length > 0) {
      const { error: upsertError } = await supabase
        .from('daily_summaries')
        .upsert(summaries, { 
          onConflict: 'user_id,summary_date',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting summaries:', upsertError);
        throw upsertError;
      }
    }

    console.log(`Successfully generated ${summaries.length} daily summaries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        date: targetDate,
        summariesGenerated: summaries.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error generating daily summaries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}
