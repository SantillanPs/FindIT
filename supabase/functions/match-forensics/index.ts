import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { lost_item_id } = await req.json()
    console.log(`[MATCHER-V1] Initiating forensic search for lost_item: ${lost_item_id}`)

    // 1. Retrieve the Lost Item DNA
    const { data: lostItem, error: lostError } = await supabaseClient
      .from('lost_items')
      .select('*')
      .eq('id', lost_item_id)
      .single()

    if (lostError) throw lostError

    // 2. Candidate Retrieval (Tier 1: Category Filter)
    const { data: candidates, error: foundError } = await supabaseClient
      .from('found_items')
      .select('*')
      .eq('category', lostItem.category) // Rigid Filter
      .eq('status', 'reported')

    if (foundError) throw foundError

    // 3. The Weighted Scoring Algorithm (Aggregated Truth Formula)
    const matches = candidates.map(found => {
      let score = 0
      let reasoning = []

      // TIER 3: Visual DNA Tags (Max 40%) - Anchors like stickers, wallpapers
      const foundTags = found.ai_draft?.forensic_details || []
      const lostTags = lostItem.ai_matching_dna?.tags || []
      
      const tagIntersection = foundTags.filter(t => 
        lostTags.some(lt => lt.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(lt.toLowerCase()))
      )

      if (tagIntersection.length > 0) {
        // DNA is heavy. 1 hit = 20%, 2+ hits = 40% (Max)
        const dnaScore = Math.min(tagIntersection.length * 20, 40)
        score += dnaScore
        reasoning.push(`🧬 Forensic Hit: ${tagIntersection.join(", ")}`)
      }

      // TIER 2: Model Proximity (Max 25%) - iPhone family handshake
      const modelSimilarity = calculateModelProximity(found.model, lostItem.model)
      if (modelSimilarity > 0) {
        const modelScore = Math.min(modelSimilarity * 25, 25)
        score += modelScore
        reasoning.push(`📟 Model Match (${Math.round(modelSimilarity * 100)}%)`)
      }

      // TIER 4: Path Correlation (Max 20%) - "Trace Your Steps" intersection
      const lostPath = lostItem.potential_zone_ids || []
      if (lostPath.length > 0 && found.zone_id && lostPath.includes(found.zone_id)) {
        score += 20
        reasoning.push("🚶 Path Correlation (Found on your path)")
      }

      // TIER 1: Temporal Softening (Max 15%) - 48-hour probability window
      const timeDiff = Math.abs(new Date(found.created_at).getTime() - new Date(lostItem.date_last_seen || lostItem.created_at).getTime())
      const windowHours = timeDiff / (1000 * 60 * 60)
      if (windowHours < 48) {
        score += 15 
        reasoning.push("⏳ Strong Temporal Window")
      }

      // Metadata for alerting logic
      const isCritical = score >= 85

      return {
        ...found,
        match_score: Math.min(score, 100),
        match_reasoning: reasoning,
        is_high_confidence: isCritical
      }
    })

    // 4. Return ranked results
    const rankedMatches = matches
      .filter(m => m.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)

    console.log(`[MATCHER-V1] Search complete. Found ${rankedMatches.length} candidates. Top score: ${rankedMatches[0]?.match_score || 0}`)

    return new Response(JSON.stringify(rankedMatches), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// Helper: Normalized Model Proximity
function calculateModelProximity(m1: string | null, m2: string | null): number {
  if (!m1 || !m2) return 0
  if (m1.toLowerCase() === m2.toLowerCase()) return 1
  
  // Handshake Logic for iPhone Pro Families
  const proFamily = ["11 pro", "12 pro", "13 pro", "14 pro", "15 pro", "max"]
  const m1Lower = m1.toLowerCase()
  const m2Lower = m2.toLowerCase()
  
  const m1IsPro = proFamily.some(f => m1Lower.includes(f))
  const m2IsPro = proFamily.some(f => m2Lower.includes(f))
  
  if (m1IsPro && m2IsPro) return 0.7 // High similarity for identical series
  
  return 0
}
