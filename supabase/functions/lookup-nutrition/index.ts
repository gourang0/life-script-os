import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NutrientInfo {
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fats_grams: number;
  fiber_grams: number;
  sugar_grams: number;
  sodium_mg: number;
  saturated_fat_grams: number;
  vitamin_a_iu: number;
  vitamin_c_mg: number;
  calcium_mg: number;
  iron_mg: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, quantity = 100 } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required', found: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for food:', query, 'quantity:', quantity);

    // Search Open Food Facts API (free, no API key required)
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'HealthTracker/1.0 (contact@example.com)'
      }
    });

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status);
      throw new Error('Failed to search food database');
    }

    const data = await response.json();
    
    if (!data.products || data.products.length === 0) {
      console.log('No products found for:', query);
      return new Response(
        JSON.stringify({ found: false, message: 'No food found matching your search' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the best match with nutrient data
    const product = data.products.find((p: any) => p.nutriments && p.nutriments.energy_value) || data.products[0];
    
    if (!product || !product.nutriments) {
      return new Response(
        JSON.stringify({ found: false, message: 'No nutritional data available for this food' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const n = product.nutriments;
    const multiplier = quantity / 100; // API gives per 100g

    const nutrients: NutrientInfo = {
      calories: Math.round((n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0) * multiplier),
      protein_grams: Math.round((n.proteins_100g || 0) * multiplier * 10) / 10,
      carbs_grams: Math.round((n.carbohydrates_100g || 0) * multiplier * 10) / 10,
      fats_grams: Math.round((n.fat_100g || 0) * multiplier * 10) / 10,
      fiber_grams: Math.round((n.fiber_100g || 0) * multiplier * 10) / 10,
      sugar_grams: Math.round((n.sugars_100g || 0) * multiplier * 10) / 10,
      sodium_mg: Math.round((n.sodium_100g || 0) * 1000 * multiplier),
      saturated_fat_grams: Math.round((n['saturated-fat_100g'] || 0) * multiplier * 10) / 10,
      vitamin_a_iu: Math.round((n['vitamin-a_100g'] || 0) * multiplier),
      vitamin_c_mg: Math.round((n['vitamin-c_100g'] || 0) * multiplier * 10) / 10,
      calcium_mg: Math.round((n.calcium_100g || 0) * 1000 * multiplier),
      iron_mg: Math.round((n.iron_100g || 0) * 1000 * multiplier * 10) / 10,
    };

    console.log('Found product:', product.product_name, 'nutrients:', nutrients);

    return new Response(
      JSON.stringify({
        found: true,
        product_name: product.product_name || product.generic_name || query,
        brand: product.brands || null,
        serving_size: `${quantity}g`,
        nutrients,
        image_url: product.image_url || product.image_front_url || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-nutrition function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to lookup nutrition';
    return new Response(
      JSON.stringify({ error: errorMessage, found: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
