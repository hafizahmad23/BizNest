import React, { useState } from 'react';
import {
  ArrowLeft, ShieldCheck, Star, MapPin, Phone, MessageCircle, Clock,
  Sparkles, Send, CheckCircle2, ShoppingBag, Image as ImageIcon, Plus,
  MessageSquare, Share2, Copy, Heart, Eye, AlertTriangle, Loader2, LogIn,
  Edit3, BadgeCheck, Crown, Package,
} from 'lucide-react';
import { Business, User, CartItem } from '../types';
import { SEOHead } from './SEOHead';
import { validateLeadInput, validateReviewInput, FieldErrors } from '../lib/validation';

interface ActionResult {
  success: boolean;
  error?: string;
}

interface BusinessProfilePageProps {
  business: Business;
  onBack: () => void;
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

const formatPkr = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

/**
 * DEDICATED BUSINESS STOREFRONT PAGE (Daraz-style) — the full-page successor
 * of the old BusinessDetailModal. Everything the modal offered works here:
 * views increment (App-level), chat, WhatsApp/call, save, share, lead
 * inquiry, reviews (+ submit), products with add-to-cart, gallery.
 */
export const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({
  business,
  onBack,
  onSubmitLead,
  onSubmitReview,
  isDarkMode,
  currentUser,
  onOpenChat,
  onAddToCart,
  onOpenDashboard,
  onToggleSave,
  isSaved = false,
  onRequireAuth,
}) => {
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lead form state
  const [leadName, setLeadName] = useState(currentUser?.name || '');
  const [leadPhone, setLeadPhone] = useState(currentUser?.phone || '');
  const [leadEmail, setLeadEmail] = useState(currentUser?.email || '');
  const [leadMsg, setLeadMsg] = useState('');
  const [leadErrors, setLeadErrors] = useState<FieldErrors>({});
  const [leadSending, setLeadSending] = useState(false);
  const [leadServerError, setLeadServerError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);

  // Review form state
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revErrors, setRevErrors] = useState<FieldErrors>({});
  const [revSending, setRevSending] = useState(false);
  const [revServerError, setRevServerError] = useState<string | null>(null);
  const [revSubmitted, setRevSubmitted] = useState(false);

  const isOwner = Boolean(currentUser && currentUser.id === business.ownerId);
  const alreadyReviewed = Boolean(
    currentUser && business.reviews.some((r) => r.reviewerId === currentUser.id)
  );

  const shareUrl = `${window.location.origin}/?business=${business.id}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappLink = (productName?: string) =>
    `https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      `Hi ${business.name}, I found you on BizNest${
        productName ? ` and I'm interested in "${productName}"` : ''
      }. Please share details.`
    )}`;

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

  const handleAddToCartClick = (prod: {
    id: string;
    name: string;
    numericPrice?: number;
    discountPrice?: number;
    image?: string;
    isAvailable?: boolean;
  }) => {
    if (prod.isAvailable === false) return;
    const sellingPrice = prod.discountPrice ?? prod.numericPrice ?? 0;
    if (!sellingPrice || sellingPrice <= 0) return; // inquiry-only products

    onAddToCart({
      id: `cart-${prod.id}-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      productId: prod.id,
      productName: prod.name,
      price: sellingPrice,
      formattedPrice: formatPkr(sellingPrice),
      quantity: 1,
      image: prod.image || business.galleryImages[0] || business.coverImage,
    });
    setAddedItemName(prod.name);
    setTimeout(() => setAddedItemName(null), 2500);
  };

  const cardCls = isDarkMode
    ? 'bg-[#0d1322] border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900';
  const innerCls = isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200';
  const subTextCls = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const dividerCls = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  const sectionTitle =
    'text-sm font-extrabold uppercase tracking-wider flex items-center gap-2';

  return (
    <div className="pb-16">
      <SEOHead business={business} />

      {/* Back bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-emerald-400 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* ================= HEADER (cover + identity) ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <div className={`rounded-3xl border overflow-hidden shadow-xl ${cardCls}`}>
          {/* Cover */}
          <div className="relative h-44 sm:h-60 w-full bg-slate-900">
            {business.coverImage ? (
              <img src={business.coverImage} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 flex items-center justify-center">
                <span className="text-6xl font-black text-emerald-400/40">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/30 to-transparent" />

            {isOwner && (
              <button
                onClick={onOpenDashboard}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 hover:bg-emerald-400 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manage Listing</span>
              </button>
            )}
          </div>

          {/* Identity row */}
          <div className="p-5 sm:p-6 -mt-14 sm:-mt-16 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {business.logoImage ? (
                <img
                  src={business.logoImage}
                  alt={business.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 shadow-2xl ${
                    isDarkMode ? 'border-slate-700/80 bg-slate-900' : 'border-white bg-white'
                  }`}
                />
              ) : (
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 shadow-2xl flex items-center justify-center ${
                  isDarkMode ? 'border-slate-700/80 bg-slate-900' : 'border-white bg-white'
                }`}>
                  <ShoppingBag className="w-8 h-8 text-emerald-500" />
                </div>
              )}

              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                    {business.category}
                  </span>
                  {business.isVerified && (
                    <span className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                  {business.isPremium && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                      <Crown className="w-3.5 h-3.5" />
                      PREMIUM
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                  {business.name}
                </h1>
                {business.tagline && (
                  <p className={`text-xs sm:text-sm font-medium line-clamp-1 ${subTextCls}`}>
                    {business.tagline}
                  </p>
                )}
              </div>

              {/* Rating block */}
              <div className={`self-start sm:self-end flex items-center gap-3 p-3 rounded-2xl border shrink-0 ${innerCls}`}>
                <div className="text-right">
                  <div className={`text-[10px] font-bold uppercase ${subTextCls}`}>Rating</div>
                  <div className="text-lg font-black text-yellow-400 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {business.rating > 0 ? business.rating.toFixed(1) : 'New'}
                  </div>
                  <div className={`text-[10px] ${subTextCls}`}>
                    {business.reviewCount} review{business.reviewCount === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Meta row: city / hours / address / views */}
            <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs font-medium ${subTextCls}`}>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span className="font-bold">{business.city || 'Pakistan'}</span>
                {business.district ? <span>· {business.district}</span> : null}
              </span>
              {business.operatingHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold">{business.operatingHours}</span>
                </span>
              )}
              {business.address && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{business.address}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>{business.viewsCount.toLocaleString()} views</span>
              </span>
            </div>

            {/* Added-to-cart toast */}
            {addedItemName && (
              <div className="mt-4 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-black text-xs flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Added "{addedItemName}" to your cart!
                </span>
                <span className="text-[10px] uppercase font-mono">Cart Updated</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {!isOwner && (
                <button
                  onClick={() => onOpenChat(business)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>
              )}

              {(business.whatsapp || business.phone) && (
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 font-bold text-xs transition flex items-center gap-1.5 border border-emerald-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4 text-cyan-500" />
                  <span>Call</span>
                </a>
              )}

              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(business)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                    isSaved
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                      : isDarkMode
                        ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}

              <button
                onClick={handleCopyShareLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                  isDarkMode
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
                title="Copy shareable link"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`p-5 sm:p-6 rounded-3xl border ${cardCls}`}>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className={`${sectionTitle} ${subTextCls}`}>
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Products & Services ({business.productsServices.length})</span>
            </h2>
            {isOwner && onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Manage Products</span>
              </button>
            )}
          </div>

          {business.productsServices.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border text-xs ${innerCls} ${subTextCls}`}>
              This business has not added any products or services yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {business.productsServices.map((prod) => {
                const hasPrice = Boolean(prod.numericPrice && prod.numericPrice > 0);
                const hasDiscount = Boolean(
                  hasPrice && prod.discountPrice && prod.discountPrice > 0 && prod.discountPrice < prod.numericPrice!
                );
                const discountPct = hasDiscount
                  ? Math.round((1 - prod.discountPrice! / prod.numericPrice!) * 100)
                  : 0;
                const outOfStock = prod.isAvailable === false;

                return (
                  <div
                    key={prod.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col ${innerCls} ${
                      outOfStock ? 'opacity-70' : ''
                    }`}
                  >
                    {/* Product image w/ gradient fallback */}
                    <div className="relative aspect-square w-full bg-slate-900">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-emerald-950 flex items-center justify-center">
                          <span className="text-3xl font-black text-emerald-400/60">
                            {prod.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-[10px] shadow">
                          -{discountPct}%
                        </span>
                      )}
                      {outOfStock && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-slate-200 font-black text-[10px] border border-slate-600">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-1 gap-2">
                      <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      {prod.description && (
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${subTextCls}`}>
                          {prod.description}
                        </p>
                      )}

                      {/* Price row */}
                      {hasPrice ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm font-black text-emerald-500">
                            {formatPkr(hasDiscount ? prod.discountPrice! : prod.numericPrice!)}
                          </span>
                          {hasDiscount && (
                            <span className={`text-[11px] line-through ${subTextCls}`}>
                              {formatPkr(prod.numericPrice!)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`text-[11px] font-bold ${subTextCls}`}>Price on inquiry</span>
                      )}

                      {/* Per-product actions */}
                      <div className="flex items-center gap-2 mt-auto">
                        {hasPrice && !outOfStock ? (
                          <button
                            onClick={() => handleAddToCartClick(prod)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        ) : (
                          <div
                            className={`flex-1 py-2 rounded-xl text-[11px] font-bold text-center border ${dividerCls} ${subTextCls}`}
                          >
                            {outOfStock ? 'Unavailable' : 'Price on inquiry'}
                          </div>
                        )}

                        {(business.whatsapp || business.phone) && (
                          <a
                            href={whatsappLink(prod.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Ask about ${prod.name} on WhatsApp`}
                            className={`px-2.5 py-2 rounded-xl border transition ${
                              isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= ABOUT + DETAILS + GALLERY ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border space-y-5 ${cardCls}`}>
          {business.aiSummary && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-950/40 to-slate-950 border-purple-500/30 text-purple-200'
                : 'bg-purple-50/80 border-purple-200 text-purple-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-purple-500 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>BizNest AI Business Intelligence</span>
              </div>
              <p>{business.aiSummary}</p>
            </div>
          )}

          <div>
            <h2 className={`${sectionTitle} ${subTextCls} mb-2`}>
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span>About {business.name}</span>
            </h2>
            <p className={`text-sm leading-relaxed whitespace-pre-line ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {business.description || 'This business has not added a description yet.'}
            </p>
          </div>

          {/* Gallery */}
          {business.galleryImages.length > 0 && (
            <div>
              <h2 className={`${sectionTitle} ${subTextCls} mb-3`}>
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>Gallery ({business.galleryImages.length})</span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {business.galleryImages.map((imgUrl, i) => (
                  <div key={i} className={`h-28 sm:h-32 rounded-2xl overflow-hidden border group ${dividerCls}`}>
                    <img
                      src={imgUrl}
                      alt={`Gallery ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details card */}
        <div className={`p-5 sm:p-6 rounded-3xl border h-fit space-y-2.5 text-xs ${cardCls}`}>
          <h2 className={`${sectionTitle} ${subTextCls} mb-1`}>
            <MapPin className="w-4 h-4 text-cyan-500" />
            <span>Business Details</span>
          </h2>

          <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
            <span className={subTextCls}>City</span>
            <span className="font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
              {business.city || 'Pakistan'}
            </span>
          </div>
          {business.district && (
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
              <span className={subTextCls}>District</span>
              <span className="font-bold">{business.district}</span>
            </div>
          )}
          {business.address && (
            <div className={`p-3 rounded-xl border ${innerCls}`}>
              <div className={subTextCls}>Address</div>
              <div className={`font-medium mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {business.address}
              </div>
            </div>
          )}
          {business.operatingHours && (
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
              <span className={subTextCls}>Operating Hours</span>
              <span className="font-bold text-emerald-500">{business.operatingHours}</span>
            </div>
          )}
          {business.priceRange && (
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
              <span className={subTextCls}>Price Tier</span>
              <span className="font-bold">{business.priceRange}</span>
            </div>
          )}
          {business.website && (
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
              <span className={subTextCls}>Website</span>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-cyan-500 hover:underline truncate max-w-[55%]"
              >
                {business.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
            <span className={subTextCls}>Rating</span>
            <span className="font-bold text-yellow-400">
              {business.rating > 0
                ? `${business.rating.toFixed(1)} / 5 (${business.reviewCount} reviews)`
                : 'No reviews yet'}
            </span>
          </div>
          <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${innerCls}`}>
            <span className={subTextCls}>Profile Views</span>
            <span className="font-bold text-purple-400">{business.viewsCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-6 ${cardCls}`}>
          <h2 className={`${sectionTitle} ${subTextCls}`}>
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Customer Reviews ({business.reviews.length})</span>
          </h2>

          {/* Submit review */}
          <div className={`p-4 rounded-2xl border ${innerCls}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${subTextCls}`}>
              Leave a Client Review
            </h3>

            {!currentUser ? (
              <div className={`p-4 rounded-xl border border-dashed text-center space-y-2 ${innerCls}`}>
                <p className={`text-xs ${subTextCls}`}>Please log in to write a review.</p>
                {onRequireAuth && (
                  <button
                    onClick={onRequireAuth}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Login to Review
                  </button>
                )}
              </div>
            ) : isOwner ? (
              <div className={`p-3 rounded-xl border text-xs ${innerCls} ${subTextCls}`}>
                You cannot review your own business.
              </div>
            ) : alreadyReviewed ? (
              <div className={`p-3 rounded-xl border text-xs ${innerCls} ${subTextCls}`}>
                You have already reviewed this business.
              </div>
            ) : revSubmitted ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! Your review has been published and the rating has been updated.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium ${subTextCls}`}>Your rating:</span>
                  <div className={`flex items-center gap-1.5 p-2 rounded-xl border ${innerCls}`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRevRating(s)}
                        className={`p-0.5 text-base cursor-pointer ${s <= revRating ? 'text-yellow-400' : 'text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {revErrors.rating && (
                    <span className="text-[10px] text-rose-400 font-bold">{revErrors.rating}</span>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder={`Share your experience with ${business.name} (optional, min 10 characters)...`}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${inputClsOf(isDarkMode)}`}
                />
                {revErrors.comment && (
                  <p className="text-[10px] text-rose-400 font-bold mt-1">{revErrors.comment}</p>
                )}

                {revServerError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {revServerError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={revSending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  {revSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {revSending ? 'Publishing…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            {business.reviews.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border text-xs ${innerCls} ${subTextCls}`}>
                No reviews yet. Be the first to review this business.
              </div>
            ) : (
              business.reviews.map((rev) => (
                <div key={rev.id} className={`p-4 rounded-2xl border text-xs space-y-1.5 ${innerCls}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold flex items-center gap-2 min-w-0">
                      <span className="truncate">{rev.userName}</span>
                      <span className={`text-[10px] font-normal shrink-0 ${subTextCls}`}>({rev.userCity})</span>
                    </div>
                    <div className="flex items-center text-yellow-400 text-xs shrink-0">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{rev.comment}</p>
                  <div className={`text-[10px] ${subTextCls}`}>{rev.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= LEAD INQUIRY ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`p-5 sm:p-6 rounded-3xl border ${cardCls}`}>
          <h2 className={`${sectionTitle} ${subTextCls} mb-4`}>
            <Send className="w-4 h-4 text-emerald-500" />
            <span>Send a Direct Inquiry</span>
          </h2>

          {leadSent ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Inquiry sent successfully! The business will contact you soon.</span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <p className={`text-xs ${subTextCls}`}>
                Your inquiry goes straight to the owner's BizNest dashboard inbox.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] font-bold uppercase ${subTextCls}`}>Your Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs ${inputClsOf(isDarkMode)}`}
                  />
                  {leadErrors.name && (
                    <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className={`text-[10px] font-bold uppercase ${subTextCls}`}>Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="03XXXXXXXXX"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className={`w-full mt-1 p-2.5 rounded-xl border text-xs ${inputClsOf(isDarkMode)}`}
                  />
                  {leadErrors.phone && (
                    <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase ${subTextCls}`}>Email Address</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className={`w-full mt-1 p-2.5 rounded-xl border text-xs ${inputClsOf(isDarkMode)}`}
                />
                {leadErrors.email && (
                  <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.email}</p>
                )}
                {leadErrors.contact && (
                  <p className="text-[10px] text-rose-400 font-bold mt-1">{leadErrors.contact}</p>
                )}
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase ${subTextCls}`}>
                  Inquiry Message * (min 10 characters)
                </label>
                <textarea
                  rows={3}
                  placeholder="Please share pricing, availability, or delivery details..."
                  value={leadMsg}
                  onChange={(e) => setLeadMsg(e.target.value)}
                  className={`w-full mt-1 p-2.5 rounded-xl border text-xs ${inputClsOf(isDarkMode)}`}
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
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {leadSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{leadSending ? 'Sending…' : 'Send Lead Request'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer share strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl border flex-wrap ${innerCls}`}>
          <span className={`text-[11px] ${subTextCls} flex items-center gap-1.5 min-w-0`}>
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Share this business: {shareUrl}</span>
          </span>
          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small helper so form inputs match the app's style tokens. */
function inputClsOf(isDarkMode: boolean): string {
  return isDarkMode
    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400';
}
