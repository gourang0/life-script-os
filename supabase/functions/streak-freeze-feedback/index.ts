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
    const { reason_category, reason_details, was_genuine, streak_days } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating streak freeze feedback: genuine=${was_genuine}, reason=${reason_category}`);

    const prompt = was_genuine 
      ? `You are KARTAVYA's empathetic AI coach. The user had to use a streak freeze today due to a GENUINE reason. Their streak was ${streak_days || 0} days.

Reason category: ${reason_category}
Details: ${reason_details || 'Not provided'}

Generate a SHORT supportive message (2-3 sentences):
- Acknowledge their genuine situation with empathy
- Reassure them that it's okay and life happens
- Encourage them to get back on track tomorrow
- Use warm, understanding tone with 1-2 emojis`
      : `You are KARTAVYA's honest but caring AI coach. The user had to use a streak freeze today, but they admitted it was NOT a genuine reason (likely laziness or avoidable). Their streak was ${streak_days || 0} days.

Reason category: ${reason_category}
Details: ${reason_details || 'Not provided'}

Generate a SHORT motivational message (2-3 sentences):
- Be honest but not harsh - acknowledge their self-awareness
- Give them a gentle reality check about discipline
- Motivate them to do better tomorrow
- Remind them that admitting laziness is the first step to improvement
- Use direct but encouraging tone with 1 emoji max`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a discipline coach that gives personalized feedback based on honesty about missed tasks." },
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
    const message = data.choices?.[0]?.message?.content || getDefaultMessage(was_genuine);

    console.log("Generated feedback successfully");

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating streak freeze feedback:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      message: "Take a moment to reflect on today. Tomorrow is a fresh start! 💪",
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultMessage(wasGenuine: boolean): string {
  if (wasGenuine) {
    return "Life happens, and it's okay to take a break when you need it. Your streak is protected - rest up and come back stronger tomorrow! 🌟";
  }
  return "Hey, at least you're being honest with yourself. That self-awareness is valuable. Let's make tomorrow count! 💪";
}
