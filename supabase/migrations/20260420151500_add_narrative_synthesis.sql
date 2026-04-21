-- Migration: Add Narrative Synthesis support to lost items
-- Created: 2026-04-20

-- 1. Add synthesized_description column to lost_items
ALTER TABLE lost_items 
ADD COLUMN IF NOT EXISTS synthesized_description TEXT;

-- 2. Update Public View for Lost Items
-- We redefine the view to include the new column and ensure it's prioritized
-- Note: Redefining views requires dropping them first if they exist
DROP VIEW IF EXISTS v_public_lost_items;

CREATE VIEW v_public_lost_items AS
SELECT 
    li.id,
    li.title,
    COALESCE(li.synthesized_description, li.description) as description,
    li.description as original_description,
    li.synthesized_description as synthesized_description,
    li.location,
    li.date_lost,
    li.category,
    li.photo_url,
    li.photo_thumbnail_url,
    li.status,
    li.is_verified,
    li.owner_id,
    li.potential_zone_ids,
    -- Basic masking logic for owner names (replicated from common patterns)
    substring(p.first_name from 1 for 1) || '*** ' || substring(p.last_name from 1 for 1) || '***' as owner_name_masked
FROM lost_items li
LEFT JOIN profiles p ON li.owner_id = p.id
WHERE li.status = 'reported';
