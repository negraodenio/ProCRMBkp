-- ==============================================================================
-- FIX PROFILES COLUMNS
-- Run this in Supabase SQL Editor to enable Avatar and Phone fields.
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Also ensure messages can track the attendant name (sender_name)
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_name text;

-- Add comment to track this patch
COMMENT ON TABLE public.profiles IS 'Updated with avatar_url and phone for ProCRM Profile Management';
