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

    // 2. Role-Based Image Retrieval
    let validImages = []
    // Ensure photo_url (Main) is processed first, followed by secondary (Forensic)
    const allPhotoUrls = [photo_url, ...(Array.isArray(secondary_photos) ? secondary_photos : [])].filter(Boolean)
    
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

    if (validImages.length === 0) throw new Error("No accessible images found")

    // 3. Resilient Exchange with Key Failover
    let aiResult = null
    const maxRetries = 2
    const keyLogs = []
    
    // Explicit Role-Aware Prompt
    const prompt = `Analyze these forensic images for a lost and found system.
    
    IMPORTANT - IMAGE ROLES:
    1. THE FIRST IMAGE is the PUBLIC MAIN IMAGE. Use this for general attributes (title, category, brand, model). 
    2. THE SUBSEQUENT IMAGES are FORENSIC REFERENCE ASSETS (may contain ID cards, sensitive info). Use these ONLY for owner identification.
    
    CRITICAL PRIVACY RULE: 
    - NEVER put a person's name in the "suggested_title".
    - Even if the item is an ID card, the title should be "NEMSU Student ID", NOT "Juan Dela Cruz ID".
    
    Return ONLY a JSON object with:
    {
      "suggested_title": "Concise public title. Use institution abbreviations (NEMSU, etc). Format: '[Abbreviation] [Type]' or '[Item Name]'.",
      "skeptical_summary": "Concise summary of the item based on the MAIN image.",
      "category": "One of: Cellphone, Laptop, Tablet, ID Card, Wallet, Bag / Backpack, Keys, Headphones / Earbuds, Watch / Wearable, Water Bottle, Eyewear, Book, Notebook, Stationery, Clothing, Accessories, Electronics Accessories, Computer Peripheral, Other",
      "brand": "Detected brand from visuals.",
      "model": "Detected model from visuals.",
      "color": "Primary color from visuals.",
      "detected_owner_info": {
        "is_id_card": true/false,
        "name": "Full name ONLY from FORENSIC images (keep internal).",
        "id_number": "ID number ONLY from FORENSIC images.",
        "confidence": 0-100
      },
      "forensic_details": [{"observation": "...", "qualifier": "...", "reasoning": "..."}],
      "security_questions": ["Deep verification questions based on visual evidence."],
      "is_blurry": false,
      "is_generic": false,
      "confidence": 0-100
    }`

    const aiModel = Deno.env.get('GOOGLE_MODEL')
    if (!aiModel) throw new Error("GOOGLE_MODEL environment variable is required")
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const isPrimary = (attempt % 2 === 0 || !secondaryKey);
      const currentKey = isPrimary ? primaryKey : secondaryKey;
      const keyAlias = isPrimary ? "PRIMARY" : "SECONDARY";
      const maskedKey = '***' + (currentKey ? currentKey.slice(-4) : 'NONE');
      
      try {
        console.log(`[AI-STABILIZER-V5-DIAGNOSTIC] Attempt ${attempt + 1}/${maxRetries} | Key: ${keyAlias} | Target Model: "${aiModel}"`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${currentKey}`,
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
          keyLogs.push({ key: keyAlias, masked: maskedKey, status: 429, error: "Quota Exhausted" });
          const waitTime = (attempt + 1) * 2000;
          console.warn('[QUOTA-429] ' + keyAlias + ' exhausted. Swapping...');
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errMsg = errJson.error?.message || response.statusText;
          keyLogs.push({ key: keyAlias, masked: maskedKey, status: response.status, error: errMsg });
          throw new Error('Google API ' + response.status + ': ' + errMsg);
        }

        const resJson = await response.json();
        const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty content returned");

        aiResult = JSON.parse(text);
        break; 
      } catch (e) {
        keyLogs.push({ key: keyAlias, masked: maskedKey, error: e.message });
        if (attempt === maxRetries - 1) throw e;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!aiResult) throw new Error("AI reached maximum failover attempts.");

    // 4. Database Sync
    if (id) {
      const genericTitles = [
        'AI Processing...', 'Processing AI Report...', 'Found Item',
        'Found Item - Visual DNA pending analysis.', 'Analyzing Forensic Visuals...'
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
        .eq('id', id);
    }

    return new Response(JSON.stringify({ success: true, analysis: aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    const primaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY')
    const secondaryKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY_EXTRA')
    
    return new Response(JSON.stringify({ 
      error: "[STABILIZER-V5-PURITY]", 
      details: error.message,
      diagnostics: {
        keys_found: [primaryKey, secondaryKey].filter(Boolean).length,
        primary_masked: primaryKey ? '***' + primaryKey.slice(-4) : 'MISSING',
        secondary_masked: secondaryKey ? '***' + secondaryKey.slice(-4) : 'MISSING',
        failover_logs: error.message === "AI reached maximum failover attempts." ? "View server logs for full retry chain" : error.message,
        purity_confirmed: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
