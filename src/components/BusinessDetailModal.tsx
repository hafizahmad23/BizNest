import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShieldCheck, Star, MapPin, Phone, MessageCircle,
  Sparkles, Send, CheckCircle2, ShoppingBag, Image as ImageIcon, Map, Plus, Edit3, MessageSquare,
  Search, Share2, Copy, Code, Heart, Eye, AlertTriangle, Loader2, LogIn
} from 'lucide-react';
import { Business, User, CartItem } from '../types';
import { SEOHead } from './SEOHead';
import {
  validateLeadInput,
  validateReviewInput,
  FieldErrors,
} from '../lib/validation';

interface ActionResult {
  success: boolean;
  error?: string;
}

interface BusinessDetailModalProps {
  business: Business | null;
  onClose: () => void;
  onSubmitLead: (
    businessId: string,
    name: string,
    phone: string,
    email: string,
    msg: string
  ) => Promise<ActionResult>;
  onSubmitReview: (
    businessId: string,
    rating: number,
    comment: string
  ) => Promise<ActionResult>;
  isDarkMode: boolean;
  currentUser: User | null;
  onOpenChat: (business: Business) => void;
  onAddToCart: (item: CartItem) => void;
  onOpenDashboard?: () => void;
  onToggleSave?: (business: Business) => void;
  isSaved?: boolean;
  onRequireAuth?: () => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  onSubmitLead,
  onSubmitReview,
  isDarkMode,
  currentUser,
  onOpenChat,
  onAddToCart,
  onOpenDashboard,
  onToggleSave,
  isSaved = false,
  onRequireAuth
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'gallery' | 'reviews' | 'inquire' | 'seo'>('overview');
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lead Form state
  const [leadName, setLeadName] = useState(currentUser?.name || '');
  const [leadPhone, setLeadPhone] = useState(currentUser?.phone || '');
  const [leadEmail, setLeadEmail] = useState(currentUser?.email || '');
  const [leadMsg, setLeadMsg] = useState('');
  const [leadErrors, setLeadErrors] = useState<FieldErrors>({});
  const [leadSending, setLeadSending] = useState(false);
  const [leadServerError, setLeadServerError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);

  // Review Form state
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revErrors, setRevErrors] = useState<FieldErrors>({});
  const [revSending, setRevSending] = useState(false);
  const [revServerError, setRevServerError] = useState<string | null>(null);
  const [revSubmitted, setRevSubmitted] = useState(false);

  if (!business) return null;

  const isOwner = Boolean(currentUser && currentUser.id === business.ownerId);
  const alreadyReviewed = Boolean(
    currentUser && business.reviews.some((r) => r.reviewerId === currentUser.id)
  );

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?business=${business.id}` : `https://biznest.pk/?business=${business.id}`;
  const seoTitle = `${business.name} — ${business.category} in ${business.city} | BizNest Pakistan`;
  const seoDesc = business.description
    ? `${business.name} is a ${business.category} business in ${business.city}, Pakistan. ${business.tagline || ''}`.trim()
    : `${business.name} — ${business.category} in ${business.city}, Pakistan. Contact details, prices, and reviews on BizNest.`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLeadInput({
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      message: leadMsg,
    });
    setLeadErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLeadSending(true);
    setLeadServerError(null);
    const result = await onSubmitLead(business.id, leadName, leadPhone, leadEmail, leadMsg);
    setLeadSending(false);

    if (!result.success) {
      setLeadServerError(result.error || 'Could not send your inquiry. Please try again.');
      return;
    }

    setLeadSent(true);
    setTimeout(() => {
      setLeadMsg('');
      setLeadSent(false);
    }, 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateReviewInput({ rating: revRating, comment: revComment });
    setRevErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRevSending(true);
    setRevServerError(null);
    const result = await onSubmitReview(business.id, revRating, revComment);
    setRevSending(false);

    if (!result.success) {
      setRevServerError(result.error || 'Could not submit your review. Please try again.');
      return;
    }

    setRevSubmitted(true);
    setTimeout(() => {
      setRevComment('');
      setRevSubmitted(false);
    }, 3000);
  };

  const handleAddToCartClick = (prod: { id: string; name: string; description: string; price?: string; numericPrice?: number }) => {
    const numPrice = prod.numericPrice ?? parseInt(prod.price?.replace(/[^0-9]/g, '') || '0', 10);
    if (!numPrice || numPrice <= 0) return; // products without a set price are inquiry-only

    const cartItem: CartItem = {
      id: `cart-${prod.id}-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      productId: prod.id,
      productName: prod.name,
      price: numPrice,
      formattedPrice: `PKR ${numPrice.toLocaleString()}`,
      quantity: 1,
      image: business.galleryImages[0] || business.coverImage
    };

    onAddToCart(cartItem);
    setAddedItemName(prod.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  return (
    <AnimatePresence>
      <SEOHead business={business} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col ${
            isDarkMode ? 'bg-[#030712]/95 border-white/10 backdrop-blur-2xl text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Top Close & Owner Edit Button */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 hover:bg-emerald-400 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manage Listing</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-950/80 text-white border border-slate-700/80 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Banner Section */}
          <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
            {business.coverImage ? (
              <img
                src={business.coverImage}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/40 to-transparent" />

            {/* Profile Logo & Key Header Info */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-3.5">
                {business.logoImage ? (
                  <img
                    src={business.logoImage}
                    alt={business.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700/80 shadow-2xl bg-slate-900"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-700/80 shadow-2xl bg-slate-900 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-emerald-500" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                      {business.category}
                    </span>
                    {business.isVerified && (
                      <span className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {business.name}
                  </h1>
                  {business.tagline && (
                    <p className="text-xs text-slate-300 font-medium line-clamp-1">
                      {business.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-2 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 shadow-xl self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rating</div>
                  <div className="text-base font-black text-yellow-400 font-mono flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {business.rating > 0 ? business.rating.toFixed(1) : 'New'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Added Item Toast Notification */}
          {addedItemName && (
            <div className="bg-emerald-500 text-slate-950 px-4 py-2 font-black text-xs flex items-center justify-between shrink-0 animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Added "{addedItemName}" to your shopping cart!
              </span>
              <span className="text-[10px] uppercase font-mono">Cart Updated</span>
            </div>
          )}

          {/* Quick Action Bar (Chat, WhatsApp, Call, Save) */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              {!isOwner && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(business);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat Inquiry</span>
                </button>
              )}

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(business.name)},%20I%20found%20you%20on%20BizNest%20and%20would%20like%20to%20inquire.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold text-xs transition flex items-center gap-1.5 border border-emerald-500/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 font-bold text-xs transition flex items-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Call</span>
                </a>
              )}

              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(business)}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                    isSaved
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-400' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span>{business.rating > 0 ? business.rating.toFixed(1) : 'No ratings yet'}</span>
                <span className="text-slate-400 font-normal">({business.reviewCount} reviews)</span>
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>{business.viewsCount.toLocaleString()} views</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800/80 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Overview & Location
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'products'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Products & Services ({business.productsServices.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'gallery'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Gallery ({business.galleryImages.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'reviews'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Reviews ({business.reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('inquire')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'inquire'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Send Direct Inquiry
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'seo'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>SEO & Search Preview</span>
            </button>
          </div>

          {/* Scrollable Tab Content Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-6">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {business.aiSummary && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900 border border-purple-500/30 text-xs text-purple-200">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs mb-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>BizNest AI Business Intelligence</span>
                    </div>
                    <p className="leading-relaxed">{business.aiSummary}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2">About {business.name}</h3>
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                    {business.description || 'This business has not added a description yet.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">City:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {business.city || 'Pakistan'}
                      </span>
                    </div>
                    {business.district && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">District:</span>
                        <span className="font-bold text-slate-200">{business.district}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="text-slate-300 text-right">{business.address}</div>
                    )}

                    {business.operatingHours && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Operating Hours:</span>
                        <span className="font-bold text-emerald-400">{business.operatingHours}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rating:</span>
                      <span className="font-bold text-yellow-400">
                        {business.rating > 0 ? `${business.rating.toFixed(1)} / 5 (${business.reviewCount} reviews)` : 'No reviews yet'}
                      </span>
                    </div>
                    {business.priceRange && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Price Tier:</span>
                        <span className="font-bold text-white">{business.priceRange}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profile Views:</span>
                      <span className="font-bold text-purple-300">{business.viewsCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Map Location */}
                <div>
                  <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-cyan-400" />
                    <span>Location ({business.city || 'Pakistan'})</span>
                  </h3>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80"
                      alt="Map View"
                      className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                    <div className="absolute z-10 text-center p-4 bg-slate-950/90 rounded-2xl border border-slate-800 max-w-sm">
                      <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-bounce" />
                      <div className="text-xs font-bold text-white">{business.name}</div>
                      <div className="text-[11px] text-slate-400">{business.address || business.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS & SERVICES */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Catalog & Offerings</h3>
                {business.productsServices.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                    This business has not added any products or services yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {business.productsServices.map((prod) => {
                      const hasPrice = Boolean(prod.numericPrice && prod.numericPrice > 0);
                      return (
                        <div key={prod.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-sm font-bold text-white">{prod.name}</h4>
                              {prod.price && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                                  {prod.price}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{prod.description}</p>
                          </div>

                          <div className="flex gap-2 mt-3">
                            {hasPrice ? (
                              <button
                                onClick={() => handleAddToCartClick(prod)}
                                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
                            ) : (
                              <div className="flex-1 py-2 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-bold text-center">
                                Price on inquiry
                              </div>
                            )}

                            <button
                              onClick={() => {
                                onClose();
                                onOpenChat(business);
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Inquire</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Business Photos</h3>
                {business.galleryImages.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    No photos uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {business.galleryImages.map((imgUrl, i) => (
                      <div key={i} className="h-40 rounded-2xl overflow-hidden border border-slate-800 group">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${i}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Submit Review Form */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider mb-3">Leave a Client Review</h3>

                  {!currentUser ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-400">Please log in to write a review.</p>
                      {onRequireAuth && (
                        <button
                          onClick={onRequireAuth}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          Login to Review
                        </button>
                      )}
                    </div>
                  ) : isOwner ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                      You cannot review your own business.
                    </div>
                  ) : alreadyReviewed ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                      You have already reviewed this business.
                    </div>
                  ) : revSubmitted ? (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Thank you! Your review has been published and the business rating has been updated.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 font-medium">Your rating:</span>
                        <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRevRating(s)}
                              className={`p-1 text-sm ${s <= revRating ? 'text-yellow-400' : 'text-slate-600'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        {revErrors.rating && (
                          <span className="text-[10px] text-rose-400 font-bold">{revErrors.rating}</span>
                        )}
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          placeholder={`Share your experience with ${business.name} (optional, min 10 characters)...`}
                          value={revComment}
                          onChange={(e) => setRevComment(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                        />
                        {revErrors.comment && (
                          <p className="text-[10px] text-rose-400 font-bold mt-1">{revErrors.comment}</p>
                        )}
                      </div>

                      {revServerError && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {revServerError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={revSending}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-60 flex items-center gap-2"
                      >
                        {revSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {revSending ? 'Publishing…' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  {business.reviews.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                      No reviews yet. Be the first to review this business.
                    </div>
                  ) : (
                    business.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{rev.userName}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({rev.userCity})</span>
                          </div>
                          <div className="flex items-center text-yellow-400 text-xs">
                            {'★'.repeat(rev.rating)}
                          </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{rev.comment}</p>
                        <div className="text-[10px] text-slate-500">{rev.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: INQUIRE / LEAD FORM */}
            {activeTab === 'inquire' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1628] border border-slate-800">
                  <h3 className="text-base font-bold text-white mb-1">Direct Lead Inquiry to {business.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">Your inquiry is saved to the business owner's dashboard inbox.</p>

                  {leadSent ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Inquiry sent successfully! The business will contact you soon.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name *</label>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          {leadErrors.name && (
                            <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Phone / WhatsApp</label>
                          <input
                            type="text"
                            placeholder="03XXXXXXXXX"
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          {leadErrors.phone && (
                            <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                        <input
                          type="email"
                          placeholder="yourname@gmail.com"
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        {leadErrors.email && (
                          <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.email}</p>
                        )}
                        {leadErrors.contact && (
                          <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.contact}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Inquiry Message * (min 10 characters)</label>
                        <textarea
                          rows={3}
                          placeholder="Please share pricing, availability, or delivery details..."
                          value={leadMsg}
                          onChange={(e) => setLeadMsg(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        {leadErrors.message && (
                          <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.message}</p>
                        )}
                      </div>

                      {leadServerError && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {leadServerError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={leadSending}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {leadSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{leadSending ? 'Sending…' : 'Send Lead Request'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SEO & SEARCH ENGINE PREVIEW */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-slate-900 border border-purple-500/30 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs mb-1">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>React Helmet Dynamic Meta & SEO Indexing</span>
                    </div>
                    <p className="text-[11px] text-purple-300/80">This page dynamically injects the document title, Open Graph tags, and Schema.org JSON-LD structured data using React Helmet.</p>
                  </div>

                  <button
                    onClick={handleCopyShareLink}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow transition"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Share URL'}</span>
                  </button>
                </div>

                {/* Google Search Result Snippet Simulator */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Search Engine Preview</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      Indexed by React Helmet
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 font-sans">
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                      <span>biznest.pk</span>
                      <span>›</span>
                      <span>{(business.city || 'pakistan').toLowerCase()}</span>
                      <span>›</span>
                      <span className="text-slate-300">{business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
                    </div>

                    <h4 className="text-base font-medium text-blue-400 hover:underline cursor-pointer leading-snug">
                      {seoTitle}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono py-0.5">
                      <span>Rating: {business.rating > 0 ? `${business.rating.toFixed(1)} ★` : 'Not rated yet'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{business.reviewCount} reviews</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{business.city}, PK</span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {seoDesc}
                    </p>
                  </div>
                </div>

                {/* Social Share Card Preview */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp & Open Graph Social Media Link Card</span>
                  </span>

                  <div className="max-w-md rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl">
                    <div className="h-36 w-full relative bg-slate-800">
                      {business.coverImage && (
                        <img src={business.coverImage} alt="Social Preview" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-emerald-400 font-extrabold border border-emerald-500/40">
                        {business.category} • {business.city}
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1 bg-slate-900/95">
                      <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">BIZNEST.PK</div>
                      <div className="text-xs font-bold text-white line-clamp-1">{seoTitle}</div>
                      <div className="text-[11px] text-slate-300 line-clamp-2 leading-tight">{seoDesc}</div>
                    </div>
                  </div>
                </div>

                {/* Schema.org JSON-LD Structured Data Viewer */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Schema.org LocalBusiness JSON-LD Metadata</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">schema.org/LocalBusiness</span>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': business.name,
  'description': business.description || business.tagline,
  'telephone': business.phone,
  'email': business.email,
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': business.city,
    'addressCountry': 'PK',
    'streetAddress': business.address
  },
  ...(business.reviewCount > 0
    ? {
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': business.rating,
          'reviewCount': business.reviewCount
        }
      }
    : {})
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
