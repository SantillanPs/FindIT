import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    const description = payload.description 
    
    if (!description) throw new Error("No description provided")

    // 1. Setup API Keys (Multi-Key Resilience)
    let primaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
    let secondaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY_EXTRA')
    
    console.log('[LOST-AI] Starting Narrative Synthesis Flow.');

    const prompt = `You are a direct and helpful university assistant. 
Your task is to take a lost item story and turn it into a simple, matter-of-fact English narrative.

Guidelines:
- translate multi-lingual inputs (Tagalog, etc.) into simple English.
- Use a direct, first-person tone ("I lost my...", "My item is...").
- Use common, localized vocabulary (e.g., use "husband" or "wife" instead of "spouse").
- DO NOT use emotional filler like "Oh no!", "Unfortunately", or "Please help".
- DO NOT use jargon like "distinguishing features".
- Keep it short, honest, and easy to read.

Return ONLY a JSON object with:
{
  "category": "One of: smartphone, laptop, tablet, electronics, audio, bags, wallets, eyewear, accessories, identification, documents, keys, umbrella, gear, money, clothing, other",
  "suggested_title": "A short, descriptive title (e.g. 'Blue Hydro Flask with Stickers', 'Lost Black Leather Wallet')",
  "attributes": {
    "color": "Primary color(s)",
    "brand": "Detected brand or 'Generic'",
    "model": "Detected model or 'Unknown'",
    "details": "Simple description of key details (e.g. stickers, case color, cracks)"
  },
  "location_hints": ["List of buildings or rooms mentioned"],
  "timeframe_hint": "Simple time (e.g. 'Monday Lunchtime')",
  "synthesized_description": "A friendly, simple English story of what happened.",
  "confidence": 0-100
}

Input Narrative: "${description}"`

    const aiModel = Deno.env.get('GOOGLE_MODEL')
    if (!aiModel) throw new Error("GOOGLE_MODEL environment variable is required")

    let aiResult = null
    const maxRetries = 2

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const currentKey = (attempt === 0 || !secondaryKey) ? primaryKey : secondaryKey;
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        )

        if (!response.ok) {
          throw new Error(`Google API ${response.status}`);
        }

        const resJson = await response.json();
        const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty content returned");

        aiResult = JSON.parse(text);
        break; 
      } catch (e) {
        if (attempt === maxRetries - 1) throw e;
        console.warn(`[RETRY] ${e.message}`);
      }
    }

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('[CRITICAL-FAILURE]', error.message)
    return new Response(JSON.stringify({ 
      error: `Google API Error: ${error.message}`,
      synthesized_description: description, // Fallback to original narrative
      debug: {
        timestamp: new Date().toISOString(),
        model: Deno.env.get('GOOGLE_MODEL') || 'unknown',
        status: "failed"
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
