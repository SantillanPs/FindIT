-- Adds multi-location support for path correlation
ALTER TABLE public.lost_items 
ADD COLUMN IF NOT EXISTS potential_zone_ids UUID[];

-- Update comment for AI context
COMMENT ON COLUMN public.lost_items.potential_zone_ids IS 'Array of zone/building IDs visited by the owner (Step Tracing).';
