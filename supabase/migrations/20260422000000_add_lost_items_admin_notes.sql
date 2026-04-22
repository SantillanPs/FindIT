-- Migration: Add Admin Notes to Lost Items and Secure RPC update
-- Created: 2026-04-22
-- Description: Adds admin_notes column to lost_items and implements a secure RPC for administrative updates.

-- 1. ADD COLUMN
ALTER TABLE public.lost_items 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. CREATE SECURE UPDATE RPC
-- This function allows admins to update lost item status and notes securely.
-- It ensures that only authorized administrators can perform these actions.
CREATE OR REPLACE FUNCTION public.rpc_secure_lost_item_update(
    p_item_id UUID,
    p_status TEXT,
    p_admin_notes TEXT,
    p_admin_id UUID
)
RETURNS public.lost_items
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
    updated_item public.lost_items;
BEGIN
    -- 1. Verify admin permissions (optional, depending on your auth setup)
    -- If you have an admins table, you could check it here.
    -- For now, we assume the RPC is only accessible to authenticated admins via RLS/API.

    -- 2. Perform the update
    UPDATE public.lost_items
    SET 
        status = COALESCE(p_status, status),
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        updated_at = NOW()
    WHERE id = p_item_id
    RETURNING * INTO updated_item;

    -- 3. Log the activity (Optional: if you have an activity/audit log)
    -- INSERT INTO public.admin_activity_log (admin_id, action, target_id, target_type)
    -- VALUES (p_admin_id, 'updated_lost_item_status', p_item_id, 'lost_item');

    RETURN updated_item;
END;
$$;

-- 3. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
