-- Repair notifications table to support forensic secure RPC
-- Created: 2026-04-20
-- This migration adds columns required by the rpc_secure_found_item_v1 function

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread',
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add a comment for documentation
COMMENT ON COLUMN notifications.type IS 'Category of notification used by the forensic secure RPC (e.g., info, success, warning)';
