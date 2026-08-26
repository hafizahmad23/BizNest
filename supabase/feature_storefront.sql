-- ============================================================================
-- BizNest Pakistan — STOREFRONT FEATURE MIGRATION (v1 upgrade)
-- File: supabase/feature_storefront.sql
--
-- WHAT THIS FILE DOES (each block is explained below and is safe to re-run):
--   BLOCK 1: Adds the `discount_price` column (+ guard) to business_products
--            so owners can set a discounted sale price per product.
--   BLOCK 2: Creates two PUBLIC Supabase Storage buckets:
--            `product-images` and `business-images`, plus RLS policies on
--            storage.objects so anyone can VIEW images, while only signed-in
--            users can upload/edit/delete files inside their OWN
--            `<auth.uid>/...` folder.
--   BLOCK 3: Enforces ONE BUSINESS PER ACCOUNT:
--            3a) A SELECT that lists any owner with MORE THAN 1 business.
--                >>> RUN THE FILE ONCE FIRST AND CHECK THIS QUERY'S RESULT <<<
--                It MUST return 0 rows before the unique index is created.
--            3b) A guarded UNIQUE index on businesses(owner_id). The DO block
--                skips index creation (with a NOTICE) if duplicates exist, so
--                the script never fails.
--
-- HOW TO RUN (non-technical owner):
--   Supabase Dashboard → SQL Editor → New Query → paste this ENTIRE file →
--   Run. Repeat safe. No existing data is deleted or modified.
--
-- IDEMPOTENT: every statement uses IF NOT EXISTS / ON CONFLICT / guarded DO
-- blocks, so re-running produces no errors and no duplicate rows.
-- ============================================================================

-- ============================================================================
-- BLOCK 1 — business_products.discount_price (product sale price)
-- Adds a nullable discount/sale price column to the existing business_products
-- table. NULL = no discount. A CHECK guard guarantees the discount (when set)
-- is positive and strictly lower than the original price.
-- ============================================================================

ALTER TABLE business_products
  ADD COLUMN IF NOT EXISTS discount_price DECIMAL(12,2);

-- Add the validation constraint only once (guarded — no error on re-run).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_discount_valid'
  ) THEN
    ALTER TABLE business_products
      ADD CONSTRAINT chk_products_discount_valid
      CHECK (
        discount_price IS NULL
        OR (discount_price > 0 AND (price IS NULL OR discount_price < price))
      );
  END IF;
END $$;

-- ============================================================================
-- BLOCK 2 — IMAGE STORAGE (public buckets + owner-only writes)
-- Creates two public buckets. Public = images are readable by anyone via
-- their public URL (required for storefront cards). Writes are restricted by
-- the storage.objects policies below to the uploader's own folder:
--   <auth.uid()>/<filename>   e.g. 6b1f.../1712345678-photo.jpg
-- Allowed types: JPG / PNG / WEBP / GIF. Max size: 5 MB (enforced by the
-- bucket config AND re-validated in the app before upload).
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 'product-images', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = TRUE,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images', 'business-images', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = TRUE,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read: anyone (incl. anonymous visitors) may view images.
DROP POLICY IF EXISTS biznest_images_public_read ON storage.objects;
CREATE POLICY biznest_images_public_read ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('product-images','business-images'));

-- Signed-in users may upload ONLY into their own <auth.uid()>/ folder.
DROP POLICY IF EXISTS biznest_images_owner_insert ON storage.objects;
CREATE POLICY biznest_images_owner_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('product-images','business-images')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Signed-in users may overwrite ONLY their own files.
DROP POLICY IF EXISTS biznest_images_owner_update ON storage.objects;
CREATE POLICY biznest_images_owner_update ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('product-images','business-images')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('product-images','business-images')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Signed-in users may delete ONLY their own files.
DROP POLICY IF EXISTS biznest_images_owner_delete ON storage.objects;
CREATE POLICY biznest_images_owner_delete ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('product-images','business-images')
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- BLOCK 3 — ONE BUSINESS PER ACCOUNT (guarded unique index)
--
-- STEP 3a (VERIFY FIRST): the SELECT below lists every account that currently
-- owns MORE THAN ONE business. Run this file once and check the query result:
--   • If it returns 0 rows → perfect, the unique index in STEP 3b is created
--     automatically on this run (and future re-runs).
--   • If it returns ANY rows → the DO block below SKIPS creating the index
--     (you will see a NOTICE). Resolve the duplicates first (delete the extra
--     listings from the app dashboard or re-assign them with your DBA), then
--     re-run this file. The app already blocks new duplicates either way.
-- ============================================================================

-- STEP 3a: duplicate-owner audit (expect ZERO rows).
SELECT owner_id,
       COUNT(*) AS business_count,
       STRING_AGG(name, ' | ') AS business_names
FROM businesses
GROUP BY owner_id
HAVING COUNT(*) > 1;

-- STEP 3b: guarded unique index — one business row per owner, forever.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_businesses_owner_unique'
  ) THEN
    RAISE NOTICE 'Unique index idx_businesses_owner_unique already exists — nothing to do.';
  ELSIF EXISTS (
    SELECT 1 FROM businesses GROUP BY owner_id HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'SKIPPED: some owners still have more than one business. Resolve the rows listed by the audit SELECT above, then re-run this file.';
  ELSE
    CREATE UNIQUE INDEX idx_businesses_owner_unique ON businesses (owner_id);
    RAISE NOTICE 'Created unique index idx_businesses_owner_unique on businesses(owner_id).';
  END IF;
END $$;

-- ============================================================================
-- DONE. (Run supabase/cities_bulk.sql AFTER this file — see its own header.)
-- ============================================================================
