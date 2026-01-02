import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodItems } = await req.json();
    
    if (!foodItems || typeof foodItems !== 'string' || foodItems.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Food items are required', identified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    console.log('Analyzing food items:', foodItems);

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
            content: `You are a nutrition expert. Analyze the given food items and provide accurate nutritional estimates.
            
IMPORTANT RULES:
1. If the input doesn't contain recognizable food items (random text, gibberish, non-food items), respond with: {"identified": false}
2. If you can identify food items, provide nutritional estimates in this exact JSON format:
{
  "identified": true,
  "calories": <number>,
  "protein_grams": <number>,
  "carbs_grams": <number>,
  "fats_grams": <number>,
  "fiber_grams": <number>,
  "analysis": "<brief description of the meal and nutritional breakdown>"
}

Be practical and estimate based on typical serving sizes if not specified. Always return valid JSON only, no additional text.`
          },
          {
            role: 'user',
            content: `Analyze these food items and provide nutritional information: ${foodItems}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', identified: false }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded.', identified: false }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to analyze nutrition');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let nutritionData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      nutritionData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content, parseError);
      // If parsing fails, assume food wasn't identified properly
      return new Response(
        JSON.stringify({ identified: false, error: 'Could not analyze the food items' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-nutrition function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze nutrition';
    return new Response(
      JSON.stringify({ error: errorMessage, identified: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
