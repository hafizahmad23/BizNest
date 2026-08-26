// ============================================================================
// BizNest Pakistan — Supabase Database Service Layer
// ALL database operations for the frontend live here.
// Rules enforced in this file:
//  - owner/reviewer/buyer/sender IDs ALWAYS come from the auth session,
//    never from caller-supplied input.
//  - Every function returns a { data, error } result (never throws).
//  - When Supabase is not configured a clear configuration error is returned.
// ============================================================================

import { supabase, isSupabaseConfigured, DATABASE_NOT_CONFIGURED_ERROR } from './supabase';
import { sanitizeText, sanitizeMultiline } from './validation';
import type {
  AdminStats,
  AppNotification,
  Business,
  BusinessStatus,
  CartItem,
  CategoryItem,
  ChatConversation,
  ChatMessage,
  CityRow,
  DistrictRow,
  LeadInquiry,
  LeadStatus,
  Order,
  OrderItemInput,
  OrderStatus,
  PaymentMethod,
  PlatformStats,
  ProductOrService,
  ProfileRow,
  ProvinceRow,
  Review,
  User,
} from '../types';

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

export interface BusinessFilters {
  categoryId?: string;
  cityId?: string;
  provinceId?: string;
  districtId?: string;
  search?: string;
  featuredOnly?: boolean;
  status?: BusinessStatus | 'any';
  sortBy?: 'rating' | 'newest' | 'mostViewed';
  page?: number;
  pageSize?: number;
}

export interface CreateBusinessInput {
  name: string;
  tagline?: string;
  description: string;
  categoryId: string;
  provinceId: string;
  districtId: string;
  cityId: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website?: string;
  fullAddress?: string;
  operatingHours?: string;
  priceRange?: string;
  logoUrl?: string; // public Supabase Storage URL (business-images bucket)
  coverUrl?: string; // public Supabase Storage URL (business-images bucket)
  products?: { id?: string; name: string; description: string; price?: number; imageUrl?: string }[];
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number; // required, PKR
  discountPrice?: number | null; // optional sale price, must be < price
  imageUrl?: string | null; // public Supabase Storage URL (product-images)
  isAvailable?: boolean;
}

/** One business listing per account (enforced by DB index too — see
 *  supabase/feature_storefront.sql). Shared with the UI for clear errors. */
export const ONE_BUSINESS_PER_ACCOUNT_ERROR =
  'Each BizNest account can manage one business listing. You already have a listing — open your dashboard to edit it, or delete it first to create a new one.';

function isDuplicateOwnerDbError(error: any): boolean {
  // 23505 = unique_violation. The owner unique index is the only unique
  // constraint on businesses that can collide on insert (name is not unique).
  return Boolean(
    error && (error.code === '23505' || String(error.message || '').includes('duplicate key'))
  );
}

// ---------------------------------------------------------------------------
// INTERNAL HELPERS
// ---------------------------------------------------------------------------

function err(message?: string | null, fallback = 'Something went wrong. Please try again.'): string {
  return message || fallback;
}

async function getSessionUserId(): Promise<{ userId: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { userId: null, error: DATABASE_NOT_CONFIGURED_ERROR };
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { userId: null, error: 'Please log in to continue.' };
  }
  return { userId: user.id, error: null };
}

function notConfigured<T>(): DbResult<T> {
  return { data: null, error: DATABASE_NOT_CONFIGURED_ERROR };
}

export function formatDbDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatDbTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const BUSINESS_SELECT = `
  *,
  categories ( name, slug ),
  provinces ( name ),
  districts ( name ),
  cities ( name, latitude, longitude ),
  business_products ( * )
`;

function mapOperatingHours(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.text === 'string') return value.text;
  return '';
}

function mapProductRow(row: any): ProductOrService {
  const priceNum = row.price != null ? Number(row.price) : undefined;
  const discountNum = row.discount_price != null ? Number(row.discount_price) : undefined;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    numericPrice: priceNum,
    price: priceNum != null ? `PKR ${priceNum.toLocaleString('en-PK')}` : undefined,
    discountPrice: discountNum,
    discountedPrice:
      discountNum != null ? `PKR ${discountNum.toLocaleString('en-PK')}` : undefined,
    image: row.image_url || undefined,
    isAvailable: row.is_available !== false,
  };
}

/** Map a joined Supabase business row into the UI Business model. */
export function mapBusinessRow(row: any, savedCountMap?: Map<string, number>): Business {
  const products: ProductOrService[] = Array.isArray(row.business_products)
    ? [...row.business_products]
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map(mapProductRow)
    : [];

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug || undefined,
    tagline: row.tagline || '',
    category: row.categories?.name || 'General',
    categoryId: row.category_id || undefined,
    province: row.provinces?.name || undefined,
    provinceId: row.province_id || undefined,
    district: row.districts?.name || undefined,
    districtId: row.district_id || undefined,
    city: row.cities?.name || '',
    cityId: row.city_id || undefined,
    address: row.full_address || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    website: row.website || undefined,
    instagram: undefined,
    facebook: undefined,
    coverImage: row.cover_url || '',
    logoImage: row.logo_url || '',
    galleryImages: Array.isArray(row.gallery_urls) ? row.gallery_urls : [],
    description: row.description || '',
    aiSummary: row.ai_summary || undefined,
    aiKeywords: Array.isArray(row.ai_keywords) ? row.ai_keywords : undefined,
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    isPremium: Boolean(row.is_premium),
    status: row.status,
    rating: typeof row.rating === 'number' ? row.rating : Number(row.rating || 0),
    reviewCount: row.review_count ?? 0,
    operatingHours: mapOperatingHours(row.operating_hours),
    priceRange: row.price_range || '',
    latitude: row.latitude ?? row.cities?.latitude ?? undefined,
    longitude: row.longitude ?? row.cities?.longitude ?? undefined,
    productsServices: products,
    reviews: [],
    viewsCount: row.views_count ?? 0,
    leadsCount: row.leads_count ?? 0,
    savedCount: savedCountMap?.get(row.id) ?? 0,
    createdAt: row.created_at || '',
  };
}

function mapReviewRow(row: any): Review {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    userName: row.profiles?.full_name || 'BizNest User',
    userCity: row.profiles?.city || 'Pakistan',
    rating: row.rating,
    date: formatDbDate(row.created_at),
    comment: row.comment || '',
  };
}

function mapLeadRow(row: any, businessName?: string, businessCity?: string): LeadInquiry {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: businessName || row.businesses?.name || 'Business',
    senderId: row.sender_id || undefined,
    senderName: row.sender_name,
    senderPhone: row.sender_phone || '',
    senderEmail: row.sender_email || '',
    message: row.message,
    city: businessCity || row.businesses?.cities?.name || '',
    createdAt: formatDbDate(row.created_at),
    status: row.status,
  };
}

function mapNotificationRow(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.body || '',
    timestamp: formatDbDate(row.created_at),
    isRead: Boolean(row.is_read),
    type: row.type,
    referenceId: row.reference_id || undefined,
    referenceType: row.reference_type || undefined,
  };
}

export function mapProfileToUser(profile: ProfileRow, savedBusinessIds: string[] = []): User {
  return {
    id: profile.id,
    name: profile.full_name || profile.email?.split('@')[0] || 'User',
    email: profile.email || '',
    role: profile.role,
    phone: profile.phone || undefined,
    city: profile.city || undefined,
    avatarUrl: profile.avatar_url || undefined,
    savedBusinessIds,
    createdAt: profile.created_at || '',
  };
}

// ============================================================================
// BUSINESSES
// ============================================================================

export async function fetchBusinesses(filters: BusinessFilters = {}): Promise<DbResult<Business[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 100;

  let query = supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('status', filters.status && filters.status !== 'any' ? filters.status : 'active');

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.cityId) query = query.eq('city_id', filters.cityId);
  if (filters.provinceId) query = query.eq('province_id', filters.provinceId);
  if (filters.districtId) query = query.eq('district_id', filters.districtId);
  if (filters.featuredOnly) query = query.eq('is_featured', true);

  const safeTerm = (filters.search || '').trim().replace(/[.,()"'\\]/g, ' ').replace(/\s+/g, ' ').trim();
  if (safeTerm) {
    const q = `%${safeTerm}%`;
    query = query.or(`name.ilike.${q},tagline.ilike.${q},description.ilike.${q}`);
  }

  if (filters.sortBy === 'rating') {
    query = query.order('rating', { ascending: false });
  } else if (filters.sortBy === 'mostViewed') {
    query = query.order('views_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error } = await query;
  if (error) return { data: null, error: err(error.message) };

  return { data: (data || []).map((row: any) => mapBusinessRow(row)), error: null };
}

export async function fetchBusinessById(id: string): Promise<DbResult<Business>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) return { data: null, error: err(error.message) };
  if (!data) return { data: null, error: 'Business not found.' };

  const business = mapBusinessRow(data);

  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('*, profiles ( full_name, city )')
    .eq('business_id', id)
    .eq('is_moderated', false)
    .order('created_at', { ascending: false });

  business.reviews = (reviewRows || []).map(mapReviewRow);

  return { data: business, error: null };
}

export async function fetchBusinessesByOwner(ownerId: string): Promise<DbResult<Business[]>> {
  if (!isSupabaseConfigured) return notConfigured();
  if (!ownerId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map((row: any) => mapBusinessRow(row)), error: null };
}

export async function createBusiness(input: CreateBusinessInput): Promise<DbResult<Business>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  // ONE BUSINESS PER ACCOUNT — client-side pre-check for a clear message.
  // The guarded UNIQUE index (supabase/feature_storefront.sql) is the real
  // enforcement; this just makes the error friendly instead of a DB message.
  const { count: ownedCount } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId);
  if ((ownedCount ?? 0) >= 1) {
    return { data: null, error: ONE_BUSINESS_PER_ACCOUNT_ERROR };
  }

  const insert = {
    owner_id: userId, // ALWAYS from the auth session — never from caller input
    name: sanitizeText(input.name, 100),
    tagline: sanitizeText(input.tagline || '', 160) || null,
    description: sanitizeMultiline(input.description, 5000),
    category_id: input.categoryId,
    province_id: input.provinceId,
    district_id: input.districtId,
    city_id: input.cityId,
    phone: sanitizeText(input.phone, 30),
    whatsapp: sanitizeText(input.whatsapp || input.phone, 30),
    email: sanitizeText(input.email, 200),
    website: sanitizeText(input.website || '', 300) || null,
    full_address: sanitizeText(input.fullAddress || '', 300) || null,
    operating_hours: input.operatingHours ? { text: sanitizeText(input.operatingHours, 120) } : null,
    price_range: sanitizeText(input.priceRange || '', 60) || null,
    logo_url: sanitizeText(input.logoUrl || '', 500) || null,
    cover_url: sanitizeText(input.coverUrl || '', 500) || null,
    // moderation-sensitive fields use DB defaults:
    // status='pending', is_verified=false, is_featured=false, is_premium=false,
    // rating=0, review_count=0, views_count=0, leads_count=0
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert(insert)
    .select(BUSINESS_SELECT)
    .single();

  if (error) {
    if (isDuplicateOwnerDbError(error)) {
      return { data: null, error: ONE_BUSINESS_PER_ACCOUNT_ERROR };
    }
    return { data: null, error: err(error.message) };
  }

  // Optional initial products/services
  if (input.products && input.products.length > 0) {
    const rows = input.products
      .filter((p) => p.name && p.name.trim())
      .map((p, idx) => ({
        business_id: data.id,
        name: sanitizeText(p.name, 140),
        description: sanitizeMultiline(p.description || '', 1000),
        price: typeof p.price === 'number' && p.price > 0 ? p.price : null,
        image_url: p.imageUrl || null,
        display_order: idx,
      }));

    if (rows.length > 0) {
      await supabase.from('business_products').insert(rows);
    }
  }

  return fetchBusinessById(data.id);
}

export async function updateBusiness(
  id: string,
  updates: Partial<CreateBusinessInput>
): Promise<DbResult<Business>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  // Verify ownership first (RLS enforces too, but this gives a clean message)
  const { data: existing, error: fetchError } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) return { data: null, error: err(fetchError.message) };
  if (!existing) return { data: null, error: 'Business not found.' };
  if (existing.owner_id !== userId) {
    return { data: null, error: 'You can only edit your own business listings.' };
  }

  const patch: Record<string, any> = {};
  if (updates.name !== undefined) patch.name = sanitizeText(updates.name, 100);
  if (updates.tagline !== undefined) patch.tagline = sanitizeText(updates.tagline, 160) || null;
  if (updates.description !== undefined) patch.description = sanitizeMultiline(updates.description, 5000);
  if (updates.categoryId) patch.category_id = updates.categoryId;
  if (updates.provinceId) patch.province_id = updates.provinceId;
  if (updates.districtId) patch.district_id = updates.districtId;
  if (updates.cityId) patch.city_id = updates.cityId;
  if (updates.phone !== undefined) patch.phone = sanitizeText(updates.phone, 30);
  if (updates.whatsapp !== undefined) patch.whatsapp = sanitizeText(updates.whatsapp, 30);
  if (updates.email !== undefined) patch.email = sanitizeText(updates.email, 200);
  if (updates.website !== undefined) patch.website = sanitizeText(updates.website, 300) || null;
  if (updates.fullAddress !== undefined) patch.full_address = sanitizeText(updates.fullAddress, 300) || null;
  if (updates.operatingHours !== undefined)
    patch.operating_hours = updates.operatingHours ? { text: sanitizeText(updates.operatingHours, 120) } : null;
  if (updates.priceRange !== undefined) patch.price_range = sanitizeText(updates.priceRange, 60) || null;
  if (updates.logoUrl !== undefined) patch.logo_url = sanitizeText(updates.logoUrl || '', 500) || null;
  if (updates.coverUrl !== undefined) patch.cover_url = sanitizeText(updates.coverUrl || '', 500) || null;
  // NEVER patch: status, is_verified, is_featured, is_premium, owner_id,
  // rating, review_count (DB triggers protect these server-side too)

  const { error } = await supabase.from('businesses').update(patch).eq('id', id);
  if (error) return { data: null, error: err(error.message) };

  // Sync the products list if the caller supplied one. This is a SYNC, not
  // a delete-all+reinsert: rows submitted with their existing product id are
  // UPDATED in place (so photo, discount price and availability added via
  // the dedicated product page survive), removed rows are deleted, and
  // brand-new rows are inserted.
  if (updates.products) {
    const { data: existingRows, error: listError } = await supabase
      .from('business_products')
      .select('id')
      .eq('business_id', id);
    if (listError) return { data: null, error: err(listError.message) };

    const existingIds = new Set((existingRows || []).map((r: any) => r.id));
    const submitted = updates.products.filter((p) => p.name && p.name.trim());
    const keptIds = new Set(
      submitted.map((p) => p.id).filter((pid): pid is string => Boolean(pid && existingIds.has(pid)))
    );

    const removedIds = [...existingIds].filter((pid) => !keptIds.has(pid));
    if (removedIds.length > 0) {
      const { error: delError } = await supabase
        .from('business_products')
        .delete()
        .in('id', removedIds);
      if (delError) return { data: null, error: err(delError.message) };
    }

    let order = 0;
    for (const p of submitted) {
      const fields = {
        name: sanitizeText(p.name, 140),
        description: sanitizeMultiline(p.description || '', 1000) || null,
        price: typeof p.price === 'number' && p.price > 0 ? p.price : null,
        display_order: order++,
      };

      if (p.id && keptIds.has(p.id)) {
        const { error: updError } = await supabase
          .from('business_products')
          .update(fields)
          .eq('id', p.id);
        if (updError) return { data: null, error: err(updError.message) };
      } else {
        const { error: insError } = await supabase.from('business_products').insert({
          ...fields,
          business_id: id,
          image_url: p.imageUrl || null,
        });
        if (insError) return { data: null, error: err(insError.message) };
      }
    }
  }

  return fetchBusinessById(id);
}

export async function updateBusinessAiContent(
  id: string,
  ai: { tagline?: string; description?: string; keywords?: string[]; summary?: string }
): Promise<DbResult<Business>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const patch: Record<string, any> = {};
  if (ai.tagline) patch.tagline = sanitizeText(ai.tagline, 160);
  if (ai.description) {
    patch.description = sanitizeMultiline(ai.description, 5000);
    patch.ai_description = sanitizeMultiline(ai.description, 5000);
  }
  if (ai.keywords && ai.keywords.length > 0) patch.ai_keywords = ai.keywords.slice(0, 12);
  if (ai.summary) patch.ai_summary = sanitizeMultiline(ai.summary, 1000);

  if (Object.keys(patch).length === 0) {
    return { data: null, error: 'Nothing to update.' };
  }

  const { error } = await supabase
    .from('businesses')
    .update(patch)
    .eq('id', id)
    .eq('owner_id', userId);

  if (error) return { data: null, error: err(error.message) };
  return fetchBusinessById(id);
}

export async function deleteBusiness(id: string): Promise<DbResult<{ id: string }>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId);

  if (error) return { data: null, error: err(error.message) };
  return { data: { id }, error: null };
}

export async function incrementBusinessViews(id: string): Promise<DbResult<null>> {
  if (!isSupabaseConfigured) return notConfigured();
  const { error } = await supabase.rpc('increment_business_views', { biz_id: id });
  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

// ============================================================================
// PRODUCTS (dedicated add/edit/delete flow — complements the legacy
// products[] list replace used by createBusiness/updateBusiness)
// ============================================================================

/** Ownership check used by every product write (RLS re-enforces too). */
async function assertBusinessOwnership(
  businessId: string
): Promise<{ userId: string | null; error: string | null }> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { userId: null, error: authError };

  const { data: existing, error: fetchError } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', businessId)
    .maybeSingle();

  if (fetchError) return { userId: null, error: err(fetchError.message) };
  if (!existing) return { userId: null, error: 'Business not found.' };
  if (existing.owner_id !== userId) {
    return { userId: null, error: 'You can only manage products of your own business.' };
  }
  return { userId, error: null };
}

export async function createProduct(
  businessId: string,
  input: ProductInput
): Promise<DbResult<Business>> {
  const { error: ownError } = await assertBusinessOwnership(businessId);
  if (ownError) return { data: null, error: ownError };

  const { count: existingCount } = await supabase
    .from('business_products')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);

  const { error } = await supabase.from('business_products').insert({
    business_id: businessId,
    name: sanitizeText(input.name, 140),
    description: sanitizeMultiline(input.description || '', 1000) || null,
    price: input.price,
    discount_price: input.discountPrice ?? null,
    image_url: sanitizeText(input.imageUrl || '', 500) || null,
    is_available: input.isAvailable !== false,
    display_order: existingCount ?? 0,
  });

  if (error) return { data: null, error: err(error.message) };
  // Return the refreshed business so callers update their state in one step.
  return fetchBusinessById(businessId);
}

export async function updateProduct(
  productId: string,
  input: ProductInput
): Promise<DbResult<Business>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: product, error: fetchError } = await supabase
    .from('business_products')
    .select('id, business_id, businesses ( owner_id )')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError) return { data: null, error: err(fetchError.message) };
  if (!product) return { data: null, error: 'Product not found.' };
  // supabase-js may shape the joined row as an array when multiple FK paths
  // exist — normalize both shapes.
  const bizRow: any = Array.isArray(product.businesses) ? product.businesses[0] : product.businesses;
  const ownerId = bizRow?.owner_id;
  if (ownerId !== userId) {
    return { data: null, error: 'You can only manage products of your own business.' };
  }

  const { error } = await supabase
    .from('business_products')
    .update({
      name: sanitizeText(input.name, 140),
      description: sanitizeMultiline(input.description || '', 1000) || null,
      price: input.price,
      discount_price: input.discountPrice ?? null,
      image_url: sanitizeText(input.imageUrl || '', 500) || null,
      is_available: input.isAvailable !== false,
    })
    .eq('id', productId);

  if (error) return { data: null, error: err(error.message) };
  return fetchBusinessById(product.business_id);
}

export async function deleteProduct(productId: string): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: product, error: fetchError } = await supabase
    .from('business_products')
    .select('id, business_id, businesses ( owner_id )')
    .eq('id', productId)
    .maybeSingle();

  if (fetchError) return { data: null, error: err(fetchError.message) };
  if (!product) return { data: null, error: null }; // already gone — idempotent
  // supabase-js may shape the joined row as an array when multiple FK paths
  // exist — normalize both shapes.
  const bizRow: any = Array.isArray(product.businesses) ? product.businesses[0] : product.businesses;
  const ownerId = bizRow?.owner_id;
  if (ownerId !== userId) {
    return { data: null, error: 'You can only manage products of your own business.' };
  }

  const { error } = await supabase.from('business_products').delete().eq('id', productId);
  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function fetchReviewsByBusiness(
  businessId: string,
  page = 0,
  pageSize = 20
): Promise<DbResult<Review[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles ( full_name, city )')
    .eq('business_id', businessId)
    .eq('is_moderated', false)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map(mapReviewRow), error: null };
}

export async function createReview(
  businessId: string,
  rating: number,
  comment: string
): Promise<DbResult<Review>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  // Block reviewing your own business (client-side convenience check —
  // enforced again by RLS).
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', businessId)
    .maybeSingle();

  if (biz && biz.owner_id === userId) {
    return { data: null, error: 'You cannot review your own business.' };
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      business_id: businessId,
      reviewer_id: userId, // from session
      rating,
      comment: sanitizeMultiline(comment, 2000) || null,
    })
    .select('*, profiles ( full_name, city )')
    .single();

  if (error) {
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      return { data: null, error: 'You have already reviewed this business.' };
    }
    return { data: null, error: err(error.message) };
  }

  return { data: mapReviewRow(data), error: null };
}

export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string
): Promise<DbResult<Review>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, comment: sanitizeMultiline(comment, 2000) || null })
    .eq('id', reviewId)
    .eq('reviewer_id', userId)
    .select('*, profiles ( full_name, city )')
    .single();

  if (error) return { data: null, error: err(error.message) };
  return { data: mapReviewRow(data), error: null };
}

export async function deleteReview(reviewId: string): Promise<DbResult<{ id: string }>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('reviewer_id', userId);

  if (error) return { data: null, error: err(error.message) };
  return { data: { id: reviewId }, error: null };
}

/** Reviews the current user has written (for dashboards). */
export async function fetchMyReviews(): Promise<DbResult<Review[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles ( full_name, city )')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map(mapReviewRow), error: null };
}

// ============================================================================
// LEADS
// ============================================================================

export interface CreateLeadInput {
  businessId: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
}

export async function createLead(input: CreateLeadInput): Promise<DbResult<LeadInquiry>> {
  if (!isSupabaseConfigured) return notConfigured();

  // Sender id from session when logged in (guests may inquire too — sender
  // id stays NULL and the policy still allows the insert).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('business_leads')
    .insert({
      business_id: input.businessId,
      sender_id: user?.id || null,
      sender_name: sanitizeText(input.senderName, 100),
      sender_email: sanitizeText(input.senderEmail || '', 200) || null,
      sender_phone: sanitizeText(input.senderPhone || '', 30) || null,
      message: sanitizeMultiline(input.message, 2000),
    });

  if (error) return { data: null, error: err(error.message) };

  // The UI only needs success/failure. Build the return value from the
  // input fields because an anon/guest sender may INSERT into business_leads
  // but cannot SELECT it back (RLS), which would make select().single()
  // throw a misleading 406 "Cannot coerce".
  return {
    data: {
      id: '',
      businessId: input.businessId,
      businessName: '',
      senderId: user?.id || undefined,
      senderName: sanitizeText(input.senderName, 100),
      senderPhone: sanitizeText(input.senderPhone || '', 30),
      senderEmail: sanitizeText(input.senderEmail || '', 200),
      message: sanitizeMultiline(input.message, 2000),
      city: '',
      createdAt: formatDbDate(new Date().toISOString()),
      status: 'new',
    },
    error: null,
  };
}

export async function fetchLeadsByBusiness(businessId: string): Promise<DbResult<LeadInquiry[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('business_leads')
    .select('*, businesses ( name, cities ( name ) )')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map((row: any) => mapLeadRow(row)), error: null };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<DbResult<LeadInquiry>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('business_leads')
    .update({ status })
    .eq('id', leadId)
    .select('*, businesses ( name, cities ( name ) )')
    .single();

  if (error) return { data: null, error: err(error.message) };
  return { data: mapLeadRow(data), error: null };
}

// ============================================================================
// SAVED BUSINESSES
// ============================================================================

export async function fetchSavedBusinesses(userId?: string): Promise<DbResult<Business[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  let uid = userId;
  if (!uid) {
    const { userId: sessionId, error: authError } = await getSessionUserId();
    if (authError || !sessionId) return { data: [], error: null };
    uid = sessionId;
  }

  const { data, error } = await supabase
    .from('saved_businesses')
    .select(`business_id, businesses ( ${BUSINESS_SELECT} )`)
    .eq('user_id', uid);

  if (error) return { data: null, error: err(error.message) };

  const businesses = (data || [])
    .map((row: any) => row.businesses)
    .filter(Boolean)
    .map((row: any) => mapBusinessRow(row));

  return { data: businesses, error: null };
}

export async function saveBusiness(businessId: string): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('saved_businesses')
    .upsert({ user_id: userId, business_id: businessId }, { onConflict: 'user_id,business_id' });

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

export async function unsaveBusiness(businessId: string): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('saved_businesses')
    .delete()
    .eq('user_id', userId)
    .eq('business_id', businessId);

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

export async function isBusinessSaved(businessId: string): Promise<DbResult<boolean>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: false, error: null };

  const { data, error } = await supabase
    .from('saved_businesses')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .maybeSingle();

  if (error) return { data: false, error: err(error.message) };
  return { data: Boolean(data), error: null };
}

// ============================================================================
// CONVERSATIONS & MESSAGES
// ============================================================================

export async function getOrCreateConversation(businessId: string): Promise<DbResult<string>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_id', userId)
    .maybeSingle();

  if (findError) return { data: null, error: err(findError.message) };
  if (existing) return { data: existing.id, error: null };

  const { data, error } = await supabase
    .from('conversations')
    .insert({ business_id: businessId, customer_id: userId })
    .select('id')
    .single();

  if (error) {
    // Concurrent create race: re-select
    const retry = await supabase
      .from('conversations')
      .select('id')
      .eq('business_id', businessId)
      .eq('customer_id', userId)
      .maybeSingle();
    if (retry.data) return { data: retry.data.id, error: null };
    return { data: null, error: err(error.message) };
  }

  return { data: data.id, error: null };
}

export async function fetchMessages(conversationId: string): Promise<DbResult<ChatMessage[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles ( full_name )')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: err(error.message) };

  const messages: ChatMessage[] = (data || []).map((row: any) => ({
    id: row.id,
    senderId: row.sender_id,
    senderName: row.profiles?.full_name || 'User',
    senderRole: 'customer', // role resolved by ChatModal via isMine flag
    text: row.content,
    timestamp: formatDbTime(row.created_at),
  }));

  return { data: messages, error: null };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<DbResult<ChatMessage>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const clean = sanitizeMultiline(content, 2000);
  if (!clean) return { data: null, error: 'Message cannot be empty.' };

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: userId, content: clean })
    .select('*, profiles ( full_name )')
    .single();

  if (error) return { data: null, error: err(error.message) };

  return {
    data: {
      id: data.id,
      senderId: data.sender_id,
      senderName: (data as any).profiles?.full_name || 'You',
      senderRole: 'customer',
      text: data.content,
      timestamp: formatDbTime(data.created_at),
    },
    error: null,
  };
}

/** Subscribe to new messages in a conversation via Supabase Realtime. */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: ChatMessage) => void
): () => void {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        const row = payload.new;
        callback({
          id: row.id,
          senderId: row.sender_id,
          senderName: '',
          senderRole: 'customer',
          text: row.content,
          timestamp: formatDbTime(row.created_at),
        });
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/** All conversations for the current user — both as customer and as owner. */
export async function fetchUserConversations(): Promise<DbResult<ChatConversation[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: [], error: null };

  const { data: owned } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId);
  const ownedIds = (owned || []).map((b: any) => b.id);

  const orFilter =
    ownedIds.length > 0
      ? `customer_id.eq.${userId},business_id.in.(${ownedIds.join(',')})`
      : `customer_id.eq.${userId}`;

  const { data, error } = await supabase
    .from('conversations')
    .select('*, businesses ( id, name, logo_url, owner_id ), profiles!conversations_customer_id_fkey ( full_name )')
    .or(orFilter)
    .order('last_message_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };

  const conversations: ChatConversation[] = (data || []).map((row: any) => ({
    id: row.id,
    businessId: row.business_id,
    businessName: row.businesses?.name || 'Business',
    businessLogo: row.businesses?.logo_url || '',
    customerId: row.customer_id,
    customerName: row.profiles?.full_name || 'Customer',
    lastMessage: '',
    lastUpdated: row.last_message_at,
    unreadCount: 0,
    messages: [],
  }));

  if (conversations.length > 0) {
    const ids = conversations.map((c) => c.id);
    const { data: msgs } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false });

    const lastByConv = new Map<string, string>();
    (msgs || []).forEach((m: any) => {
      if (!lastByConv.has(m.conversation_id)) {
        lastByConv.set(m.conversation_id, m.content);
      }
    });
    conversations.forEach((c) => {
      c.lastMessage = lastByConv.get(c.id) || '';
    });
  }

  return { data: conversations, error: null };
}

// ============================================================================
// CART
// ============================================================================

export async function getOrCreateCart(): Promise<DbResult<string>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: existing, error: findError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) return { data: null, error: err(findError.message) };
  if (existing) return { data: existing.id, error: null };

  const { data, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) return { data: null, error: err(error.message) };
  return { data: data.id, error: null };
}

export async function fetchCartItems(): Promise<DbResult<CartItem[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: [], error: null };

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!cart) return { data: [], error: null };

  const { data, error } = await supabase
    .from('cart_items')
    .select('*, business_products ( id, name, price, image_url, business_id, businesses ( name, logo_url ) )')
    .eq('cart_id', cart.id);

  if (error) return { data: null, error: err(error.message) };

  const items: CartItem[] = (data || [])
    .filter((row: any) => row.business_products)
    .map((row: any) => {
      const price = Number(row.business_products.price || 0);
      return {
        id: row.id,
        productId: row.product_id,
        productName: row.business_products.name,
        price,
        formattedPrice: `PKR ${price.toLocaleString('en-PK')}`,
        quantity: row.quantity,
        businessId: row.business_products.business_id,
        businessName: row.business_products.businesses?.name || 'Business',
        businessLogo: row.business_products.businesses?.logo_url || undefined,
        image: row.business_products.image_url || undefined,
      };
    });

  return { data: items, error: null };
}

export async function addToCart(productId: string, quantity = 1): Promise<DbResult<CartItem[]>> {
  const cartRes = await getOrCreateCart();
  if (cartRes.error || !cartRes.data) return { data: null, error: cartRes.error };

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartRes.data)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) return { data: null, error: err(error.message) };
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartRes.data, product_id: productId, quantity });
    if (error) return { data: null, error: err(error.message) };
  }

  return fetchCartItems();
}

export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<DbResult<CartItem[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) return { data: null, error: err(error.message) };
  return fetchCartItems();
}

export async function removeFromCart(cartItemId: string): Promise<DbResult<CartItem[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) return { data: null, error: err(error.message) };
  return fetchCartItems();
}

export async function clearCart(): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!cart) return { data: null, error: null };

  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

// ============================================================================
// CART TOTALS
// ============================================================================

/**
 * Canonical cart totals rule: items are grouped by business; each business
 * gets a delivery fee of 0 when its own subtotal is greater than 10000,
 * otherwise 250. The grand total is the combined subtotal + combined fees.
 */
export function computeCartTotals(
  items: CartItem[]
): { subtotal: number; deliveryFee: number; grandTotal: number } {
  const perBusiness = new Map<string, number>();
  items.forEach((item) => {
    perBusiness.set(
      item.businessId,
      (perBusiness.get(item.businessId) || 0) + item.price * item.quantity
    );
  });

  let subtotal = 0;
  let deliveryFee = 0;
  perBusiness.forEach((businessSubtotal) => {
    subtotal += businessSubtotal;
    deliveryFee += businessSubtotal > 10000 ? 0 : 250;
  });

  return { subtotal, deliveryFee, grandTotal: subtotal + deliveryFee };
}

// ============================================================================
// ORDERS
// ============================================================================

export interface CreateOrderInput {
  businessId: string;
  items: OrderItemInput[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  transactionReference?: string;
  notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<DbResult<Order>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: orderRow, error } = await supabase
    .from('orders')
    .insert({
      buyer_id: userId, // from session, never from input
      business_id: input.businessId,
      subtotal: input.subtotal,
      delivery_fee: input.deliveryFee,
      total: input.total,
      payment_method: input.paymentMethod,
      payment_status: 'pending', // NEVER trust client-side "paid" claims
      order_status: 'placed',
      delivery_address: sanitizeMultiline(input.deliveryAddress, 500),
      transaction_reference: sanitizeText(input.transactionReference || '', 120) || null,
      notes: sanitizeMultiline(input.notes || '', 1000) || null,
    })
    .select('id, created_at')
    .single();

  if (error) return { data: null, error: err(error.message) };

  const itemRows = input.items.map((item) => ({
    order_id: orderRow.id,
    product_id: item.productId || null,
    product_name: sanitizeText(item.productName, 200),
    price: item.price,
    quantity: item.quantity,
  }));

  if (itemRows.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) return { data: null, error: err(itemsError.message) };
  }

  return {
    data: {
      id: orderRow.id,
      userId,
      userName: '',
      userEmail: '',
      userPhone: '',
      businessId: input.businessId,
      address: input.deliveryAddress,
      city: '',
      items: [],
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      totalAmount: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      transactionRef: input.transactionReference,
      notes: input.notes,
      createdAt: orderRow.created_at,
    },
    error: null,
  };
}

function mapOrderRow(row: any): Order {
  const items: CartItem[] = Array.isArray(row.order_items)
    ? row.order_items.map((oi: any) => ({
        id: oi.id,
        productId: oi.product_id || '',
        productName: oi.product_name,
        price: Number(oi.price || 0),
        formattedPrice: `PKR ${Number(oi.price || 0).toLocaleString('en-PK')}`,
        quantity: oi.quantity,
        businessId: row.business_id,
        businessName: row.businesses?.name || 'Business',
      }))
    : [];

  return {
    id: row.id,
    userId: row.buyer_id,
    userName: row.profiles?.full_name || '',
    userEmail: row.profiles?.email || '',
    userPhone: row.profiles?.phone || '',
    businessId: row.business_id,
    businessName: row.businesses?.name || 'Business',
    address: row.delivery_address || '',
    city: '',
    items,
    subtotal: Number(row.subtotal || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    totalAmount: Number(row.total || 0),
    paymentMethod: (row.payment_method || 'cod') as PaymentMethod,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    transactionRef: row.transaction_reference || undefined,
    notes: row.notes || undefined,
    createdAt: formatDbDate(row.created_at),
  };
}

export async function fetchMyOrders(): Promise<DbResult<Order[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('orders')
    .select('*, businesses ( name ), order_items ( * ), profiles ( full_name, email, phone )')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map(mapOrderRow), error: null };
}

export async function fetchBusinessOrders(businessId: string): Promise<DbResult<Order[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('orders')
    .select('*, businesses ( name ), order_items ( * ), profiles ( full_name, email, phone )')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map(mapOrderRow), error: null };
}

/** Business owner updates the fulfilment status of an order. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<DbResult<Order>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', orderId)
    .select('*, businesses ( name ), order_items ( * ), profiles ( full_name, email, phone )')
    .single();

  if (error) return { data: null, error: err(error.message) };
  return { data: mapOrderRow(data), error: null };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function fetchNotifications(): Promise<DbResult<AppNotification[]>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: [], error: null };

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map(mapNotificationRow), error: null };
}

export async function markNotificationRead(notificationId: string): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

export async function markAllNotificationsRead(): Promise<DbResult<null>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

/** Realtime subscription for new notifications of the current user. */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: AppNotification) => void
): () => void {
  if (!isSupabaseConfigured) return () => {};

  const topic = `notifications:${userId}`;
  for (const ch of supabase.getChannels()) {
    if (ch.topic === `realtime:${topic}`) void supabase.removeChannel(ch);
  }

  const channel = supabase
    .channel(topic)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        callback(mapNotificationRow(payload.new));
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

// ============================================================================
// PROFILES
// ============================================================================

/**
 * Ensure the current auth user has a minimal profiles row. Legacy users who
 * signed up before the auth trigger (or without a profile) would otherwise
 * hit a 406 on the next profiles update / role upgrade.
 */
export async function ensureProfileRow(userId: string): Promise<DbResult<null>> {
  if (!isSupabaseConfigured) return notConfigured();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const metadata = user?.user_metadata || {};

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email: user?.email ?? null,
        full_name: metadata.full_name || metadata.name || null,
        phone: metadata.phone || null,
        city: metadata.city || null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

export async function fetchProfile(userId: string): Promise<DbResult<ProfileRow>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) return { data: null, error: err(error.message) };
  if (!data) return { data: null, error: 'Profile not found.' };
  return { data: data as ProfileRow, error: null };
}

export async function updateProfile(updates: {
  fullName?: string;
  phone?: string;
  city?: string;
  avatarUrl?: string;
}): Promise<DbResult<ProfileRow>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  await ensureProfileRow(userId);

  const patch: Record<string, any> = {};
  if (updates.fullName !== undefined) patch.full_name = sanitizeText(updates.fullName, 100);
  if (updates.phone !== undefined) patch.phone = sanitizeText(updates.phone, 30);
  if (updates.city !== undefined) patch.city = sanitizeText(updates.city, 100);
  if (updates.avatarUrl !== undefined) patch.avatar_url = sanitizeText(updates.avatarUrl, 500) || null;
  // role is NEVER patched here — role changes go through dedicated functions

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) return { data: null, error: err(error.message) };
  return { data: data as ProfileRow, error: null };
}

/**
 * Upgrade the current account to a BUSINESS account.
 * Awaits the DB write first and only returns success when the profiles
 * table confirms the change — the UI must not optimistically flip roles.
 */
export async function upgradeToBusinessRole(): Promise<DbResult<ProfileRow>> {
  const { userId, error: authError } = await getSessionUserId();
  if (authError || !userId) return { data: null, error: authError };

  await ensureProfileRow(userId);

  // Only rewrite the role for plain 'user' rows — an admin or existing
  // business account matches no row, so their role can never be clobbered.
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'business' })
    .eq('id', userId)
    .eq('role', 'user')
    .select('*')
    .maybeSingle();

  if (error) return { data: null, error: err(error.message) };

  // No row updated: the caller was already 'business' or 'admin'.
  // Return their current row unchanged.
  if (!data) {
    const current = await fetchProfile(userId);
    return { data: current.data ?? null, error: current.error || 'Profile not found.' };
  }

  return { data: data as ProfileRow, error: null };
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function fetchCategories(): Promise<DbResult<CategoryItem[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return { data: null, error: err(error.message) };

  const countsRes = await fetchCategoryCounts();
  const counts = countsRes.data || {};

  const items: CategoryItem[] = (categories || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    iconName: row.icon || 'Building2',
    count: counts[row.id] || 0,
    description: row.description || '',
    popularCities: [],
  }));

  return { data: items, error: null };
}

export async function fetchCategoryWithCount(categoryId: string): Promise<DbResult<CategoryItem>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) return { data: null, error: err(error.message) };
  if (!category) return { data: null, error: 'Category not found.' };

  const countsRes = await fetchCategoryCounts();

  return {
    data: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      iconName: category.icon || 'Building2',
      count: countsRes.data?.[category.id] || 0,
      description: category.description || '',
      popularCities: [],
    },
    error: null,
  };
}

/** { categoryId: activeBusinessCount } — real numbers, 0 when none. */
export async function fetchCategoryCounts(): Promise<DbResult<Record<string, number>>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('businesses')
    .select('category_id')
    .eq('status', 'active')
    .not('category_id', 'is', null);

  if (error) return { data: null, error: err(error.message) };

  const counts: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    counts[row.category_id] = (counts[row.category_id] || 0) + 1;
  });

  return { data: counts, error: null };
}

/** { cityName(lowercase): activeBusinessCount } for map & stats widgets. */
export async function fetchCityBusinessCounts(): Promise<DbResult<Record<string, number>>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('businesses')
    .select('city_id, cities ( name )')
    .eq('status', 'active')
    .not('city_id', 'is', null);

  if (error) return { data: null, error: err(error.message) };

  const counts: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const name = row.cities?.name?.toLowerCase();
    if (name) counts[name] = (counts[name] || 0) + 1;
  });

  return { data: counts, error: null };
}

// ============================================================================
// LOCATIONS
// ============================================================================

export async function fetchProvinces(): Promise<DbResult<ProvinceRow[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase.from('provinces').select('*').order('name');
  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []) as ProvinceRow[], error: null };
}

export async function fetchDistrictsByProvince(provinceId: string): Promise<DbResult<DistrictRow[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  let query = supabase.from('districts').select('*').order('name');
  if (provinceId && provinceId !== 'all') query = query.eq('province_id', provinceId);

  const { data, error } = await query;
  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []) as DistrictRow[], error: null };
}

export async function fetchCitiesByDistrict(districtId: string): Promise<DbResult<CityRow[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  let query = supabase.from('cities').select('*').order('name');
  if (districtId && districtId !== 'all') query = query.eq('district_id', districtId);

  const { data, error } = await query;
  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []) as CityRow[], error: null };
}

export async function searchCities(queryText: string): Promise<DbResult<CityRow[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const clean = sanitizeText(queryText, 60);
  if (!clean) return { data: [], error: null };

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', `%${clean}%`)
    .order('name')
    .limit(20);

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []) as CityRow[], error: null };
}

// ============================================================================
// PLATFORM STATS (real COUNTs from the DB — never hardcoded)
// ============================================================================

export async function fetchPlatformStats(): Promise<DbResult<PlatformStats>> {
  if (!isSupabaseConfigured) return notConfigured();

  const [activeRes, reviewsRes, citiesData, categoriesData] = await Promise.all([
    supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_moderated', false),
    supabase.from('businesses').select('city_id').eq('status', 'active').not('city_id', 'is', null),
    supabase
      .from('businesses')
      .select('category_id')
      .eq('status', 'active')
      .not('category_id', 'is', null),
  ]);

  if (activeRes.error) return { data: null, error: err(activeRes.error.message) };

  const distinctCities = new Set((citiesData.data || []).map((r: any) => r.city_id));
  const distinctCategories = new Set((categoriesData.data || []).map((r: any) => r.category_id));

  return {
    data: {
      totalBusinesses: activeRes.count ?? 0,
      totalCities: distinctCities.size,
      totalReviews: reviewsRes.count ?? 0,
      totalCategories: distinctCategories.size,
    },
    error: null,
  };
}

// ============================================================================
// ADMIN (every function re-verified by RLS + is_admin() server-side)
// ============================================================================

export async function fetchPendingBusinesses(): Promise<DbResult<Business[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: err(error.message) };
  return { data: (data || []).map((row: any) => mapBusinessRow(row)), error: null };
}

/** Approve a listing — publishes it. Does NOT auto-verify it. */
export async function approveBusiness(businessId: string): Promise<DbResult<null>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { error } = await supabase
    .from('businesses')
    .update({ status: 'active' })
    .eq('id', businessId);

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}

export async function rejectBusiness(
  businessId: string,
  reason?: string
): Promise<DbResult<null>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { error } = await supabase
    .from('businesses')
    .update({ status: 'rejected' })
    .eq('id', businessId);

  if (error) return { data: null, error: err(error.message) };

  if (reason) {
    const { data: biz } = await supabase
      .from('businesses')
      .select('owner_id, name')
      .eq('id', businessId)
      .maybeSingle();
    if (biz) {
      await supabase.from('notifications').insert({
        user_id: biz.owner_id,
        type: 'business_status',
        title: 'Listing Rejected',
        body: `"${biz.name}" was rejected. Reason: ${sanitizeText(reason, 300)}`,
        reference_id: businessId,
        reference_type: 'business',
      });
    }
  }

  return { data: null, error: null };
}

export async function fetchAdminStats(): Promise<DbResult<AdminStats>> {
  if (!isSupabaseConfigured) return notConfigured();

  const count = async (table: string, filter?: (q: any) => any) => {
    let q = supabase.from(table).select('id', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: c, error } = await q;
    if (error) return 0;
    return c ?? 0;
  };

  const [
    totalUsers,
    totalBusinesses,
    pendingBusinesses,
    activeBusinesses,
    rejectedBusinesses,
    featuredBusinesses,
    premiumBusinesses,
    totalReviews,
    totalLeads,
    totalOrders,
  ] = await Promise.all([
    count('profiles'),
    count('businesses'),
    count('businesses', (q) => q.eq('status', 'pending')),
    count('businesses', (q) => q.eq('status', 'active')),
    count('businesses', (q) => q.eq('status', 'rejected')),
    count('businesses', (q) => q.eq('is_featured', true)),
    count('businesses', (q) => q.eq('is_premium', true)),
    count('reviews'),
    count('business_leads'),
    count('orders'),
  ]);

  return {
    data: {
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      activeBusinesses,
      rejectedBusinesses,
      featuredBusinesses,
      premiumBusinesses,
      totalReviews,
      totalLeads,
      totalOrders,
    },
    error: null,
  };
}

export async function fetchAllReviewsForAdmin(limit = 50): Promise<DbResult<Review[]>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles ( full_name, city )')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: err(error.message) };
  return {
    data: (data || []).map((row: any) => ({
      ...mapReviewRow(row),
      verifiedPurchase: row.is_moderated,
    })),
    error: null,
  };
}

export async function moderateReview(
  reviewId: string,
  hide: boolean
): Promise<DbResult<null>> {
  if (!isSupabaseConfigured) return notConfigured();

  const { error } = await supabase
    .from('reviews')
    .update({ is_moderated: hide })
    .eq('id', reviewId);

  if (error) return { data: null, error: err(error.message) };
  return { data: null, error: null };
}
