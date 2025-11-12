-- Allow parent_id to be NULL when child creates pairing
-- It will be set when a parent validates the code
ALTER TABLE public.device_pairings 
ALTER COLUMN parent_id DROP NOT NULL;