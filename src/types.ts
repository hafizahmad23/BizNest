// ============================================================================
// BizNest Pakistan — Central TypeScript Types
// Aligned with the Supabase schema in /supabase/migration.sql
// ============================================================================

export type UserRole = 'user' | 'business' | 'admin';

export type BusinessStatus = 'active' | 'pending' | 'rejected' | 'suspended';

export type LeadStatus = 'new' | 'contacted' | 'closed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'easypaisa'
  | 'jazzcash'
  | 'sadapay'
  | 'nayapay'
  | 'raast'
  | 'bank_transfer'
  | 'cod'
  | 'binance_pay';

// ------------------------------- UI MODELS ----------------------------------

export interface ProductOrService {
  id: string; // maps to business_products.id in Supabase
  name: string;
  price?: string; // formatted e.g. "PKR 3,500"
  numericPrice?: number;
  discountPrice?: number; // optional sale price (always < numericPrice)
  discountedPrice?: string; // formatted sale price e.g. "PKR 2,900"
  description: string;
  image?: string;
  isAvailable?: boolean; // availability toggle (defaults to true)
}

export interface Review {
  id: string;
  reviewerId?: string;
  userName: string;
  userCity: string;
  rating: number; // 1-5 (validated, real user reviews only)
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export interface Business {
  id: string;
  ownerId?: string; // profiles.id of the owner (set server-side from session)
  name: string;
  slug?: string;
  tagline: string;
  category: string; // category display name, e.g. "Restaurants & Cafes"
  categoryId?: string;
  province?: string;
  provinceId?: string;
  district?: string;
  districtId?: string;
  city: string;
  cityId?: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  coverImage: string;
  logoImage: string;
  galleryImages: string[];
  description: string;
  aiSummary?: string;
  aiKeywords?: string[];

  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  status: BusinessStatus;

  rating: number; // REAL average from reviews table (DB trigger maintained)
  reviewCount: number; // REAL count from reviews table (DB trigger maintained)

  operatingHours: string;
  priceRange: string;

  latitude?: number;
  longitude?: number;

  productsServices: ProductOrService[];
  reviews: Review[];

  viewsCount: number;
  leadsCount: number;
  savedCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // AUTHORITATIVE source = profiles.role in Supabase
  phone?: string;
  city?: string;
  businessName?: string;
  businessId?: string;
  avatarUrl?: string;
  savedBusinessIds: string[];
  createdAt: string;
}

export interface CartItem {
  id: string; // cart_items.id (DB) or a local guest id
  productId: string;
  productName: string;
  price: number; // numeric PKR
  formattedPrice: string;
  quantity: number;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  image?: string;
}

export interface OrderItemInput {
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessId?: string;
  businessName?: string;
  address: string;
  city: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus; // ALWAYS starts as 'pending'
  orderStatus: OrderStatus;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'merchant' | 'system';
  text: string;
  timestamp: string;
  containsContactInfo?: boolean;
}

export interface ChatConversation {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastUpdated: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface LeadInquiry {
  id: string;
  businessId: string;
  businessName: string;
  senderId?: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  message: string;
  city: string;
  createdAt: string;
  status: LeadStatus;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  iconName: string; // Lucide icon identifier
  count: number; // REAL count of active businesses (from DB)
  description: string;
  popularCities: string[];
}

export interface CityItem {
  id: string;
  name: string;
  province: string;
  businessCount: number; // REAL count of active businesses (from DB)
  image: string;
  lat: number;
  lng: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  city: string;
  verifiedOnly: boolean;
  minRating: number;
  sortBy: 'rating' | 'newest' | 'mostViewed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: string; // 'lead' | 'order' | 'business_status' | 'message' | ...
  referenceId?: string;
  referenceType?: string;
}

export interface PlatformStats {
  totalBusinesses: number;
  totalCities: number;
  totalReviews: number;
  totalCategories: number;
}

export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  activeBusinesses: number;
  rejectedBusinesses: number;
  featuredBusinesses: number;
  premiumBusinesses: number;
  totalReviews: number;
  totalLeads: number;
  totalOrders: number;
}

// ------------------------- SUPABASE ROW TYPES -------------------------------

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProvinceRow {
  id: string;
  name: string;
  slug: string;
}

export interface DistrictRow {
  id: string;
  province_id: string;
  name: string;
  slug: string;
}

export interface CityRow {
  id: string;
  district_id: string;
  province_id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
  display_order: number;
}

export interface BusinessRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  province_id: string | null;
  district_id: string | null;
  city_id: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  status: BusinessStatus;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  rating: number;
  review_count: number;
  views_count: number;
  leads_count: number;
  ai_description: string | null;
  ai_keywords: string[] | null;
  ai_summary: string | null;
  operating_hours: Record<string, any> | null;
  price_range: string | null;
  service_area: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  business_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: ProfileRow | null;
}

export interface LeadRow {
  id: string;
  business_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  message: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  business_id: string;
  customer_id: string;
  last_message_at: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
