import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as base64 from "https://deno.land/std@0.207.0/encoding/base64.ts"

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
    const photoUrl = payload.photo_url
    const secondaryPhotos = payload.secondary_photos || []
    
    if (!description) throw new Error("No description provided")

    console.log('[LOST-AI] Starting Multi-Modal Narrative Synthesis.');

    // 1. Setup API Keys (Multi-Key Resilience)
    let primaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
    let secondaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY_EXTRA')

    // 2. Image Retrieval (Vision Support)
    let validImages = []
    const allPhotoUrls = [photoUrl, ...(Array.isArray(secondaryPhotos) ? secondaryPhotos : [])].filter(Boolean)
    
    for (const url of allPhotoUrls) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const buffer = await resp.arrayBuffer();
        validImages.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64.encode(new Uint8Array(buffer))
          }
        });
      } catch (e) {
        console.error('[RETRIEVAL-ERROR] ' + e.message);
      }
    }

    const hasImages = validImages.length > 0;

    const prompt = `You are a direct and helpful university assistant specializing in lost and found forensics.
Your task is to take a lost item story ${hasImages ? 'and its images ' : ''}and turn it into a simple, matter-of-fact English narrative and structured metadata.

Guidelines:
- Translate multi-lingual inputs (Tagalog, etc.) into simple English.
- Use a direct, first-person tone ("I lost my...", "My item is...").
- ${hasImages ? 'CRITICALLY: Analyze the provided images to extract accurate brand, model, color, and distinguishing features.' : 'Use common, localized vocabulary.'}
- DO NOT use emotional filler like "Oh no!", "Unfortunately", or "Please help".
- DO NOT use jargon like "distinguishing features" in the narrative.
- Keep the synthesized description short, honest, and easy to read.

Return ONLY a JSON object with:
{
  "category": "One of: Cellphone, Laptop, Tablet, ID Card, Wallet, Bag / Backpack, Keys, Headphones / Earbuds, Watch / Wearable, Water Bottle, Eyewear, Book, Notebook, Stationery, Clothing, Accessories, Electronics Accessories, Computer Peripheral, Umbrella, Other",
  "suggested_title": "A short, descriptive title (e.g. 'Blue Hydro Flask with Stickers', 'Lost Black Leather Wallet')",
  "attributes": {
    "color": "Primary color(s)",
    "brand": "Detected brand or 'Generic'",
    "model": "Detected model or 'Unknown'",
    "details": "Simple description of key details (e.g. stickers, case color, cracks)"
  },
  "ai_matching_dna": {
    "tags": ["List of 3-5 visual forensic anchors for matching: e.g. 'green sticker', 'cracked screen', 'blue case', 'braided strap'"]
  },
  "location_hints": ["List of buildings or rooms mentioned in text"],
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
        const contents = [{ 
          parts: [
            { text: prompt },
            ...validImages
          ] 
        }]

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
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
      synthesized_description: typeof description === 'string' ? description : "Error processing report", 
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

