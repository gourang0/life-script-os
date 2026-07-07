import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized', found: false }), {
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
      return new Response(JSON.stringify({ error: 'Unauthorized', found: false }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const query = typeof body.query === 'string' ? body.query.slice(0, 200) : '';
    const quantity = Math.max(0.1, Math.min(10000, parseFloat(body.quantity) || 100));
    const unit = ['grams', 'quantity'].includes(body.unit) ? body.unit : 'grams';

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required', found: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for food:', query, 'quantity:', quantity, 'unit:', unit);

    const searchTerm = query.trim().toLowerCase();
    
    // List of common raw/whole foods that should skip packaged food search
    const rawFoods = ['apple', 'banana', 'orange', 'egg', 'eggs', 'chicken', 'rice', 'bread', 'milk', 
      'potato', 'tomato', 'onion', 'carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'pepper',
      'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'cheese', 'butter', 'yogurt', 'oats',
      'pasta', 'noodles', 'beans', 'lentils', 'corn', 'peas', 'cabbage', 'mushroom', 'garlic',
      'ginger', 'avocado', 'mango', 'grape', 'strawberry', 'blueberry', 'watermelon', 'pineapple',
      'coconut', 'almond', 'walnut', 'peanut', 'cashew', 'roti', 'chapati', 'dal', 'paneer', 'tofu'];
    
    const isRawFood = rawFoods.some(food => searchTerm === food || searchTerm === food + 's');
    
    // For raw foods, return not found so AI fallback handles it better
    if (isRawFood) {
      console.log('Raw food detected, skipping packaged food search:', searchTerm);
      return new Response(
        JSON.stringify({ found: false, message: 'Raw food - use AI analysis', isRawFood: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Open Food Facts API for packaged products
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
    
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

    // Find best match - prioritize products whose name closely matches the query
    const queryLower = query.toLowerCase();
    let product = data.products.find((p: any) => {
      const name = (p.product_name || '').toLowerCase();
      return name === queryLower || name.startsWith(queryLower + ' ') || name.endsWith(' ' + queryLower);
    });
    
    // If no exact match, find one with nutrient data
    if (!product) {
      product = data.products.find((p: any) => p.nutriments && (p.nutriments['energy-kcal_100g'] || p.nutriments.energy_value));
    }
    
    // Final fallback
    if (!product) {
      product = data.products[0];
    }
    
    if (!product || !product.nutriments) {
      return new Response(
        JSON.stringify({ found: false, message: 'No nutritional data available for this food' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const n = product.nutriments;
    
    // Calculate multiplier based on unit type
    let multiplier: number;
    let servingDisplay: string;
    
    if (unit === 'quantity') {
      // For quantity (count), estimate typical serving size
      // Common single serving sizes for various foods (in grams)
      const servingSize = product.serving_quantity || 100; // fallback to 100g if no serving info
      multiplier = (servingSize * quantity) / 100;
      servingDisplay = `${quantity} ${quantity > 1 ? 'pieces' : 'piece'}`;
    } else {
      // For grams, use direct calculation
      multiplier = quantity / 100; // API gives per 100g
      servingDisplay = `${quantity}g`;
    }

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
        serving_size: servingDisplay,
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
