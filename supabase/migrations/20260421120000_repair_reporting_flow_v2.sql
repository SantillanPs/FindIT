-- Migration: Repair Reporting Flow V2
-- Created: 2026-04-21
-- Description: Adds missing columns and implements the submit_lost_item_v2 and submit_found_item_v2 RPCs.

-- 1. HARDEN TABLES
-- Ensure lost_items has all required columns for the Narrative-First flow
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS original_description TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS synthesized_description TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS potential_zone_ids INTEGER[];
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.lost_items ADD COLUMN IF NOT EXISTS photo_thumbnail_url TEXT;

-- Ensure found_items has forensic columns
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS secondary_photos TEXT[] DEFAULT '{}';
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}'::jsonb;

-- 2. IMPLEMENT submit_lost_item_v2
-- This function handles both Guest and Student reports safely
DROP FUNCTION IF EXISTS public.submit_lost_item_v2(JSONB);
CREATE OR REPLACE FUNCTION public.submit_lost_item_v2(registry_signal JSONB)
RETURNS public.lost_items
LANGUAGE plpgsql
SECURITY DEFINER -- Required to allow Guests to write to the table
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
        attributes
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
        (registry_signal->>'owner_id')::UUID,
        COALESCE(registry_signal->>'status', 'reported'),
        COALESCE((registry_signal->>'is_verified')::BOOLEAN, false),
        registry_signal->>'guest_name',
        registry_signal->>'guest_email',
        registry_signal->>'guest_phone',
        COALESCE(registry_signal->'potential_zone_ids', '[]'::jsonb),
        COALESCE(registry_signal->'attributes', '{}'::jsonb)
    )
    RETURNING * INTO new_item;

    RETURN new_item;
END;
$$;

-- 3. IMPLEMENT submit_found_item_v2
DROP FUNCTION IF EXISTS public.submit_found_item_v2(JSONB);
CREATE OR REPLACE FUNCTION public.submit_found_item_v2(registry_signal JSONB)
RETURNS public.found_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_item public.found_items;
BEGIN
    INSERT INTO public.found_items (
        title,
        description,
        category,
        location,
        date_found,
        photo_url,
        photo_thumbnail_url,
        status,
        brand,
        model,
        secondary_photos,
        guest_name,
        guest_email,
        guest_phone,
        attributes
    )
    VALUES (
        COALESCE(registry_signal->>'title', 'Found Item'),
        COALESCE(registry_signal->>'description', ''),
        COALESCE(registry_signal->>'category', 'other'),
        registry_signal->>'location',
        COALESCE((registry_signal->>'date_found')::TIMESTAMPTZ, NOW()),
        registry_signal->>'photo_url',
        registry_signal->>'photo_thumbnail_url',
        COALESCE(registry_signal->>'status', 'reported'),
        registry_signal->>'brand',
        registry_signal->>'model',
        COALESCE(registry_signal->'secondary_photos', '[]'::jsonb),
        registry_signal->>'guest_name',
        registry_signal->>'guest_email',
        registry_signal->>'guest_phone',
        COALESCE(registry_signal->'attributes', '{}'::jsonb)
    )
    RETURNING * INTO new_item;

    RETURN new_item;
END;
$$;

-- 4. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
