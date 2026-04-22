import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as base64 from "https://deno.land/std@0.207.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const record = payload.record
    const triggerSource = payload.trigger_source || payload.type 
    
    if (triggerSource !== 'admin_manual') {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const { id, photo_url, secondary_photos = [], title: currentTitle } = record
    
    // 1. Multi-Key Setup (Quota Resilience V5)
    let primaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
    let secondaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY_EXTRA')
    
    console.log('[AI-STABILIZER-V5] Starting Multi-Key Purity Engine.');

    // 2. Sequential Image Retrieval
    let validImages = []
    const allPhotoUrls = [photo_url, ...(Array.isArray(secondary_photos) ? secondary_photos.slice(0, 3) : [])]
    
    for (const url of allPhotoUrls) {
      if (!url) continue;
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
        console.error(`[RETRIEVAL-ERROR] ${e.message}`);
      }
    }

    if (validImages.length === 0) throw new Error("No accessible images found")

    // 3. Resilient Exchange with Key Failover
    let aiResult = null
    const maxRetries = 4 // Increased for key rotation
    const prompt = `Analyze these forensic images for a lost and found system.
Return ONLY a JSON object with:
{
  "suggested_title": "A short, descriptive title (e.g. 'Blue Hydro Flask with Stickers', 'Black Leather Wallet')",
  "skeptical_summary": "Summary admitting visual ambiguity",
  "category": "One of: smartphone, laptop, tablet, electronics, audio, bags, wallets, eyewear, accessories, identification, documents, keys, umbrella, gear, money, clothing, other",
  "brand": "Detected brand or 'Generic'",
  "model": "Detected model or 'Generic'",
  "forensic_details": [{"observation": "...", "qualifier": "...", "reasoning": "..."}],
  "security_questions": ["As many deep owner questions as possible based on the visual evidence (aim for 5-10 unique questions). Use VERY simple English - keep it student-friendly and casual (e.g. 'What is on the phone case?')."],
  "is_blurry": false,
  "is_generic": false,
  "confidence": 0-100
}`

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Rotate key on every retry to maximize success
      const currentKey = (attempt % 2 === 0 || !secondaryKey) ? primaryKey : secondaryKey;
      
      try {
        console.log(`[AI-STABILIZER-V5] Attempt ${attempt + 1}/${maxRetries} using ${attempt % 2 === 0 ? 'Primary' : 'Secondary'} Key`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }, ...validImages] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        )

        if (response.status === 429) {
          const waitTime = (attempt + 1) * 2000;
          console.warn(`[QUOTA-429] Swapping keys or waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(`Google API ${response.status}: ${errJson.error?.message || response.statusText}`);
        }

        const resJson = await response.json();
        const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty content returned");

        aiResult = JSON.parse(text);
        break; 
      } catch (e) {
        if (attempt === maxRetries - 1) throw e;
        console.warn(`[RETRYABLE-V5] ${e.message}. Rotating...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!aiResult) throw new Error("AI reached maximum failover attempts.");

    // 4. Database Sync
    // Only overwrite title if it's a generic placeholder
    const genericTitles = [
      'AI Processing...',
      'Processing AI Report...',
      'Found Item',
      'Found Item - Visual DNA pending analysis.',
      'Analyzing Forensic Visuals...'
    ];
    
    const shouldUpdateTitle = !currentTitle || genericTitles.includes(currentTitle);
    const finalTitle = shouldUpdateTitle ? aiResult.suggested_title : currentTitle;

    await supabaseClient
      .from('found_items')
      .update({ 
        title: finalTitle,
        ai_draft: { ...aiResult, suggested_title: aiResult.suggested_title },
        brand: aiResult.brand !== 'Generic' ? aiResult.brand : record.brand,
        model: aiResult.model !== 'Generic' ? aiResult.model : record.model,
        category: aiResult.category
      })
      .eq('id', id)

    return new Response(JSON.stringify({ success: true, analysis: aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    const primaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
    const secondaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY_EXTRA')
    const keyCount = [primaryKey, secondaryKey].filter(Boolean).length

    console.error('[CRITICAL-FAILURE-V5]', error.message)
    return new Response(JSON.stringify({ 
      error: "[STABILIZER-V5-PURITY]", 
      details: error.message,
      diagnostics: {
        keys_found: keyCount,
        purity_confirmed: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
