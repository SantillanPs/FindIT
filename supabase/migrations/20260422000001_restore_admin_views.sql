-- Migration: Restore Admin Views
-- Created: 2026-04-22
-- Description: Recreates missing administrator views required by the Admin Dashboard.

-- 1. v_admin_inventory
CREATE OR REPLACE VIEW public.v_admin_inventory AS
SELECT * FROM public.found_items
WHERE status != 'released';

-- 2. v_admin_review_queue
CREATE OR REPLACE VIEW public.v_admin_review_queue AS
SELECT * FROM public.found_items
WHERE status = 'reported';

-- 3. v_admin_lost_reports
CREATE OR REPLACE VIEW public.v_admin_lost_reports AS
SELECT 
    l.*,
    p.full_name as owner_name,
    p.email as owner_email
FROM public.lost_items l
LEFT JOIN public.profiles p ON l.owner_id = p.id;

-- 4. v_admin_claims
CREATE OR REPLACE VIEW public.v_admin_claims AS
SELECT 
    c.*,
    p.full_name as owner_name,
    p.email as owner_email,
    p.student_id_number as student_id,
    p.course_department,
    fi.title as item_title,
    fi.category as item_category,
    fi.location as item_location,
    fi.photo_url as item_photo_url,
    fi.date_found as item_date_found,
    fi.challenge_questions as found_item_challenge_questions,
    fi.challenge_question as found_item_challenge_question,
    fi.verification_note as found_item_verification_note
FROM public.claims c
LEFT JOIN public.profiles p ON c.owner_id = p.id
LEFT JOIN public.found_items fi ON c.item_id = fi.id;

-- 5. v_admin_history & v_admin_activity_log
CREATE OR REPLACE VIEW public.v_admin_history AS
SELECT 
    id,
    title,
    category,
    location,
    status as action_type,
    status as status,
    released_at as timestamp,
    released_at as released_at,
    created_at as created_at,
    released_to_name as student_name,
    released_by_name as admin_name,
    admin_notes as notes,
    photo_thumbnail_url as admin_photo_url,
    'found_item' as source_type
FROM public.found_items
WHERE status = 'released'
UNION ALL
SELECT 
    c.id,
    fi.title,
    fi.category,
    fi.location,
    c.status as action_type,
    c.status as status,
    c.updated_at as timestamp,
    c.updated_at as released_at,
    c.created_at as created_at,
    p.full_name as student_name,
    NULL as admin_name,
    c.admin_notes as notes,
    NULL as admin_photo_url,
    'claim' as source_type
FROM public.claims c
LEFT JOIN public.profiles p ON c.owner_id = p.id
LEFT JOIN public.found_items fi ON c.item_id = fi.id
WHERE c.status IN ('approved', 'rejected');

CREATE OR REPLACE VIEW public.v_admin_activity_log AS SELECT * FROM public.v_admin_history;

-- 6. Refresh API Cache
NOTIFY pgrst, 'reload schema';
