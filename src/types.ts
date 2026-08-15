export interface ProductOrService {
  id: string;
  name: string;
  price?: string;
  numericPrice?: number;
  description: string;
  image?: string;
}

export interface Review {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export interface Business {
  id: string;
  ownerId?: string; // ID of the merchant user who owns this listing
  name: string;
  tagline: string;
  category: string; // e.g. "Nursery", "Restaurant", "Doctor", "Real Estate", etc.
  city: string; // e.g. "Lahore", "Karachi", "Islamabad", "Multan", etc.
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
  
  // USP Features
  trustScore: number; // e.g. 98 (out of 100)
  popularityScore: number; // e.g. 95 (out of 100)
  responseTime: string; // e.g. "< 10 mins", "< 1 hour"
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  status: 'active' | 'pending' | 'rejected';

  rating: number;
  reviewCount: number;
  isOpenNow: boolean;
  operatingHours: string;
  priceRange: 'PKR 💸' | 'PKR 💸💸' | 'PKR 💸💸💸' | 'PKR 💸💸💸💸';

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
  role: 'user' | 'business'; // User Account vs Business Account
  phone?: string;
  city?: string;
  businessName?: string;
  businessId?: string;
  savedBusinessIds: string[];
  createdAt: string;
}

export interface CartItem {
  id: string; // item unique id
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

export type PaymentMethod = 
  | 'easypaisa'
  | 'jazzcash'
  | 'sadapay'
  | 'nayapay'
  | 'raast'
  | 'bank_transfer'
  | 'cod'
  | 'binance_pay';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  address: string;
  city: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  transactionRef?: string;
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
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  message: string;
  city: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'closed';
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName: string; // Lucide icon identifier
  count: number;
  description: string;
  popularCities: string[];
}

export interface CityItem {
  id: string;
  name: string;
  province: string;
  businessCount: number;
  image: string;
  lat: number;
  lng: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  city: string;
  verifiedOnly: boolean;
  openNowOnly: boolean;
  minRating: number;
  minTrustScore: number;
  sortBy: 'trustScore' | 'popularityScore' | 'rating' | 'newest';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'inquiry_reply' | 'business_status' | 'lead' | 'order';
  linkTo?: string; // e.g. view or modal target
}

export interface PlatformStats {
  totalBusinesses: number;
  totalCities: number;
  monthlyVisitors: number;
  verifiedRate: number;
  avgResponseMinutes: number;
  totalLeadsGenerated: number;
}

