import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const age = parseInt(body.age);
    const weight_kg = parseFloat(body.weight_kg);
    const height_cm = parseFloat(body.height_cm);
    const validGenders = ['male', 'female', 'other'];
    const validActivity = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    const gender = validGenders.includes(body.gender) ? body.gender : null;
    const activity_level = validActivity.includes(body.activity_level) ? body.activity_level : 'moderate';

    if (!age || age < 10 || age > 120) {
      return new Response(JSON.stringify({ error: 'Invalid age (must be 10-120)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!weight_kg || weight_kg < 20 || weight_kg > 500) {
      return new Response(JSON.stringify({ error: 'Invalid weight (must be 20-500 kg)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!height_cm || height_cm < 50 || height_cm > 300) {
      return new Response(JSON.stringify({ error: 'Invalid height (must be 50-300 cm)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!gender) {
      return new Response(
        JSON.stringify({ error: 'Invalid gender (must be male, female, or other)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    console.log('Calculating calorie goal for:', { age, weight_kg, height_cm, gender, activity_level });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert. Calculate daily calorie needs using the Mifflin-St Jeor equation and provide personalized recommendations.

Calculate BMR:
- Men: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + 5
- Women: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) − 161

Activity multipliers:
- Sedentary (little/no exercise): BMR × 1.2
- Light (1-3 days/week): BMR × 1.375
- Moderate (3-5 days/week): BMR × 1.55
- Active (6-7 days/week): BMR × 1.725
- Very Active (hard exercise/physical job): BMR × 1.9

Return ONLY valid JSON in this format:
{
  "bmr": <number>,
  "tdee": <number>,
  "calorie_goal": <number>,
  "protein_goal_grams": <number>,
  "carbs_goal_grams": <number>,
  "fats_goal_grams": <number>,
  "recommendation": "<personalized advice string>"
}`
          },
          {
            role: 'user',
            content: `Calculate daily calorie needs for:
- Age: ${age} years
- Weight: ${weight_kg} kg
- Height: ${height_cm} cm
- Gender: ${gender}
- Activity Level: ${activity_level || 'moderate'}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to calculate calorie goal');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    if (!content) {
      throw new Error('No response from AI');
    }

    let result;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content, parseError);
      throw new Error('Failed to parse calorie calculation');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-calorie-goal function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to suggest calorie goal';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
