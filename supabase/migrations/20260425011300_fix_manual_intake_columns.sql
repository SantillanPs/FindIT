-- Migration: Fix Manual Intake Columns & RPC
-- Description: Adds missing administrative columns and fixes type casting for secondary photos.

-- 1. ADD MISSING COLUMNS TO found_items
ALTER TABLE public.found_items 
ADD COLUMN IF NOT EXISTS reporter_name TEXT,
ADD COLUMN IF NOT EXISTS assisted_by TEXT,
ADD COLUMN IF NOT EXISTS time_found TEXT;

-- 2. REDEFINE rpc_manual_intake WITH CORRECT MAPPINGS AND TYPE CASTING
CREATE OR REPLACE FUNCTION public.rpc_manual_intake(
    p_type TEXT,
    p_title TEXT,
    p_description TEXT,
    p_category TEXT,
    p_location TEXT,
    p_date TIMESTAMPTZ,
    p_reporter_name TEXT,
    p_status TEXT,
    p_assisted_by TEXT,
    p_time TEXT,
    p_photo_url TEXT,
    p_zone_id INTEGER,
    p_attributes JSONB,
    p_secondary_photos TEXT[],
    p_brand TEXT,
    p_model TEXT,
    p_identified_name TEXT,
    p_identified_id_number TEXT,
    p_identified_user_id UUID,
    p_is_public BOOLEAN DEFAULT TRUE
)
RETURNS public.found_items
LANGUAGE plpgsql
SECURITY DEFINER
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
        reporter_name,
        status,
        assisted_by,
        time_found,
        photo_url,
        zone_id,
        attributes,
        secondary_photos,
        brand,
        model,
        identified_name,
        identified_id_number,
        identified_user_id,
        is_public,
        is_manual_entry
    )
    VALUES (
        p_title,
        p_description,
        p_category,
        p_location,
        p_date,
        p_reporter_name,
        p_status,
        p_assisted_by,
        p_time,
        p_photo_url,
        p_zone_id,
        p_attributes,
        to_jsonb(p_secondary_photos),
        p_brand,
        p_model,
        p_identified_name,
        p_identified_id_number,
        p_identified_user_id,
        p_is_public,
        TRUE
    )
    RETURNING * INTO new_item;

    RETURN new_item;
END;
$$;

-- 3. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
