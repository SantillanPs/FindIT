-- Migration: Lost Items Parity V3
-- Created: 2026-04-21
-- Description: Adds brand and model columns to lost_items for parity with found_items and updates the RPC to populate them.

-- 1. ADD COLUMNS (Idempotent)
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS model TEXT;

-- 2. UPDATE submit_lost_item_v2 RPC
CREATE OR REPLACE FUNCTION public.submit_lost_item_v2(registry_signal JSONB)
RETURNS public.lost_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_item public.lost_items;
BEGIN
    INSERT INTO public.lost_items (
        title,
        description,
        original_description,
        synthesized_description,
        category,
        location,
        date_lost,
        photo_url,
        photo_thumbnail_url,
        owner_id,
        status,
        is_verified,
        guest_name,
        guest_email,
        guest_phone,
        potential_zone_ids,
        attributes,
        brand,
        model
    )
    VALUES (
        COALESCE(registry_signal->>'title', 'Lost Item'),
        COALESCE(registry_signal->>'description', ''),
        COALESCE(registry_signal->>'original_description', registry_signal->>'description'),
        registry_signal->>'synthesized_description',
        registry_signal->>'category',
        registry_signal->>'location',
        (registry_signal->>'date_lost')::TIMESTAMPTZ,
        registry_signal->>'photo_url',
        registry_signal->>'photo_thumbnail_url',
        NULLIF(registry_signal->>'owner_id', '')::UUID,
        COALESCE(registry_signal->>'status', 'reported'),
        COALESCE((registry_signal->>'is_verified')::BOOLEAN, false),
        registry_signal->>'guest_name',
        registry_signal->>'guest_email',
        registry_signal->>'guest_phone',
        COALESCE(registry_signal->'potential_zone_ids', '[]'::jsonb),
        COALESCE(registry_signal->'attributes', '{}'::jsonb),
        -- Extract brand/model from attributes if they exist
        COALESCE(registry_signal->'attributes'->>'brand', registry_signal->>'brand'),
        COALESCE(registry_signal->'attributes'->>'model', registry_signal->>'model')
    )
    RETURNING * INTO new_item;

    RETURN new_item;
END;
$$;

-- 3. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
