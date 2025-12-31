import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { level, streak, tasksCompletedToday, tasksPending, totalXP } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are KARTAVYA's AI motivation coach. Generate a SHORT motivational message (2-3 sentences max) based on this user's stats:
- Level: ${level}
- Current Streak: ${streak} days
- Tasks completed today: ${tasksCompletedToday}
- Tasks pending: ${tasksPending}
- Total XP: ${totalXP}

Rules:
- If doing well (streak > 3 or tasks completed > 2): Be encouraging and praise them
- If struggling (streak = 0 or no tasks done): Be honest but supportive, give a gentle push
- Use casual, friendly tone. Can use 1-2 emojis.
- Keep it personal and motivating, not generic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a motivational coach that keeps messages short and impactful." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Keep pushing forward! Every step counts. 💪";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: "Stay focused and keep grinding! Your goals are waiting. 🎯" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
