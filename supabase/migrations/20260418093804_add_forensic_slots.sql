-- Create forensic slots in the found_items table
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.found_items ADD COLUMN IF NOT EXISTS model TEXT;

-- Feedback to the API layer to refresh its schema cache
NOTIFY pgrst, 'reload schema';
