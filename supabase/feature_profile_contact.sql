-- =============================================================================
-- BizNest Pakistan — Profile WhatsApp contact column
-- File: supabase/feature_profile_contact.sql
--
-- WHAT THIS FILE DOES:
--   Adds an optional `whatsapp` TEXT column to public.profiles so a signed-in
--   user can save the number customers should contact them on (Account Settings).
--   Existing rows are unchanged (the column is nullable). Nothing is deleted.
--   RLS policy profiles_update_own already covers updates to this new column.
--
-- HOW TO RUN (non-technical owner):
--   Supabase Dashboard → SQL Editor → New Query → paste this ENTIRE file → Run.
--
-- EXPECTED SQL EDITOR RESULT:
--   Success. No rows returned
--
-- IDEMPOTENT: ADD COLUMN IF NOT EXISTS — safe to re-run.
-- =============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
