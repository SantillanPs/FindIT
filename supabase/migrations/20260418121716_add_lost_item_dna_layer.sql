-- Add forensic DNA layer to the lost_items table to enable high-fidelity matching
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS ai_matching_dna JSONB;

-- Refresh the API schema cache
NOTIFY pgrst, 'reload schema';
