-- Migration: Manual Intake Visibility & OCR Support
-- Description: Adds public visibility controls and prepares for AI OCR linkage.

-- 1. ADD VISIBILITY COLUMN
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- 2. REDEFINE PUBLIC VIEW
-- This ensures that items appear on the landing page based on the is_public flag
DROP VIEW IF EXISTS public.v_public_found_items;
CREATE VIEW public.v_public_found_items AS
SELECT 
    f.id,
    f.title,
    f.description,
    f.category,
    f.location,
    f.date_found,
    f.photo_url,
    f.photo_thumbnail_url,
    f.status,
    f.brand,
    f.model,
    f.attributes,
    f.zone_id,
    -- Masked student ID for public view if identified
    CASE 
        WHEN f.identified_id_number IS NOT NULL THEN 
            substring(f.identified_id_number from 1 for 2) || '****' || substring(f.identified_id_number from length(f.identified_id_number)-1)
        ELSE NULL 
    END as identified_student_id_masked
FROM public.found_items f
WHERE f.status = 'in_custody' AND f.is_public = TRUE;

-- 3. REDEFINE rpc_manual_intake
-- Updated to handle the is_public flag and forensic metadata
DROP FUNCTION IF EXISTS public.rpc_manual_intake(
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
    p_is_public BOOLEAN
);

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
        is_public
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
        p_secondary_photos,
        p_brand,
        p_model,
        p_identified_name,
        p_identified_id_number,
        p_identified_user_id,
        p_is_public
    )
    RETURNING * INTO new_item;

    RETURN new_item;
END;
$$;

-- 4. REFRESH CACHE
NOTIFY pgrst, 'reload schema';
