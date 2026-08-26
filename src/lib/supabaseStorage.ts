// ============================================================================
// BizNest Pakistan — Supabase Storage upload helper
// Uploads images into the public 'product-images' / 'business-images' buckets
// created by supabase/feature_storefront.sql.
// Rules:
//  - Files ALWAYS land inside the signed-in user's own folder: <auth.uid()/...
//    (mirrors the storage.objects RLS policies — no client can write into
//    another user's folder).
//  - Type + size validated locally AND the bucket re-validates server-side.
//  - Errors are honest and actionable (incl. "storage not configured" when
//    the bucket has not been created yet). No silent fallbacks.
// ============================================================================

import { supabase, isSupabaseConfigured, DATABASE_NOT_CONFIGURED_ERROR } from './supabase';

export type ImageBucket = 'product-images' | 'business-images';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB (matches bucket config)

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadedImage {
  url: string; // public URL — persist this (e.g. business_products.image_url)
  path: string; // storage path (<uid>/<file>) — for deletes if ever needed
}

export interface StorageResult {
  data: UploadedImage | null;
  error: string | null;
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'img';
  }
}

/** Map raw Supabase storage errors to clear, non-technical messages. */
function friendlyStorageError(raw: string): string {
  const message = (raw || '').toLowerCase();
  if (message.includes('bucket not found')) {
    return 'Image storage is not configured yet. The site owner must run supabase/feature_storefront.sql in the Supabase SQL Editor once.';
  }
  if (message.includes('payload too large') || message.includes('file size')) {
    return 'That image is too large. Please upload a JPG, PNG, WEBP or GIF under 5 MB.';
  }
  if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('row-level security') ||
    message.includes('permission')
  ) {
    return 'Could not upload: image storage permissions are not set up yet. The site owner must run supabase/feature_storefront.sql in the Supabase SQL Editor once.';
  }
  if (message.includes('mime') || message.includes('type') || message.includes('format')) {
    return 'Unsupported file type. Please upload a JPG, PNG, WEBP or GIF image.';
  }
  return 'Could not upload the image. Please check your connection and try again.';
}

/**
 * Validate + upload an image into the given bucket under the signed-in
 * user's own folder. Returns the public URL on success.
 */
export async function uploadImage(
  bucket: ImageBucket,
  file: File,
  nameHint?: string
): Promise<StorageResult> {
  if (!isSupabaseConfigured) {
    return { data: null, error: DATABASE_NOT_CONFIGURED_ERROR };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: 'Please log in to upload images.' };
  }

  if (!file || file.size === 0) {
    return { data: null, error: 'That file appears to be empty. Please choose a valid image.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      data: null,
      error: `"${file.name}" is not a supported image type. Please upload a JPG, PNG, WEBP or GIF.`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      data: null,
      error: `"${file.name}" is ${mb} MB — the maximum image size is 5 MB.`,
    };
  }

  // Path: <uid>/<timestamp>-<random>-<hint>.<ext> — always inside the
  // uploader's own RLS-protected folder.
  const hint = (nameHint || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${hint}.${extensionForMime(file.type)}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) {
    return { data: null, error: friendlyStorageError(error.message) };
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return { data: { url: publicUrlData.publicUrl, path }, error: null };
}
