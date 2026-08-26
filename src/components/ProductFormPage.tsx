import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Package, Loader2, Save, AlertTriangle, CheckCircle2,
  ImagePlus, X,
} from 'lucide-react';
import { Business, ProductOrService } from '../types';
import { sanitizeText, sanitizeMultiline } from '../lib/validation';
import { uploadImage } from '../lib/supabaseStorage';

export interface ProductFormPayload {
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface ProductFormPageProps {
  business: Business;
  /** null = create a new product; otherwise edit this product. */
  product: ProductOrService | null;
  isDarkMode: boolean;
  onSave: (payload: ProductFormPayload) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

/**
 * DEDICATED full-screen Add/Edit Product page (owner flow). Kept visually
 * consistent with the app (same Tailwind style tokens / isDarkMode variants).
 * Validation: name required; price required (PKR > 0); optional discount
 * strictly lower than price; image type/size validated in supabaseStorage.
 */
export const ProductFormPage: React.FC<ProductFormPageProps> = ({
  business,
  product,
  isDarkMode,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(
    product?.numericPrice != null ? String(product.numericPrice) : ''
  );
  const [discount, setDiscount] = useState(
    product?.discountPrice != null ? String(product.discountPrice) : ''
  );
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image || null);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable !== false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Escape key closes (convenience only — the Back button is the primary).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  const cardCls = isDarkMode
    ? 'bg-[#0d1322] border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900';
  const inputCls = isDarkMode
    ? 'bg-slate-950 border-slate-800 text-white'
    : 'bg-slate-50 border-slate-300 text-slate-900';
  const labelCls = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const subTextCls = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const parseAmount = (raw: string): number | undefined => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    if (!cleaned) return undefined;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const result = await uploadImage('product-images', file, name || 'product');
    setUploading(false);
    if (result.error || !result.data) {
      setUploadError(result.error || 'Could not upload the image. Please try again.');
      return;
    }
    setImageUrl(result.data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const nextErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'Product name is required (minimum 2 characters).';
    }
    const priceNum = parseAmount(price);
    if (price == null || price.trim() === '' || priceNum == null || priceNum <= 0) {
      nextErrors.price = 'Price is required (a positive amount in PKR).';
    }
    let discountNum: number | null = null;
    if (discount.trim() !== '') {
      const parsed = parseAmount(discount);
      if (parsed == null || !Number.isFinite(parsed) || parsed <= 0) {
        nextErrors.discount = 'Discount price must be a positive amount in PKR.';
      } else if (priceNum != null && priceNum > 0 && parsed >= priceNum) {
        nextErrors.discount = 'Discount price must be lower than the original price.';
      } else {
        discountNum = parsed;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const result = await onSave({
      name: sanitizeText(name, 140),
      description: sanitizeMultiline(description, 1000),
      price: priceNum as number,
      discountPrice: discountNum,
      imageUrl,
      isAvailable,
    });
    setSaving(false);

    if (!result.success) {
      setServerError(result.error || 'Could not save the product. Please try again.');
      return;
    }
    setSavedAt(Date.now());
    // Brief success confirmation, then back to the dashboard.
    setTimeout(() => onClose(), 700);
  };

  const handleMoneyChange = (setter: (v: string) => void) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits + a single dot while typing; full validation happens on submit.
    const v = ev.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setter(v);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Page header + back */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className={`p-2.5 rounded-xl border transition cursor-pointer disabled:opacity-50 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            disabled={saving}
            title="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              {product ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className={`text-xs ${subTextCls} truncate`}>
              for <span className="font-bold text-emerald-400">{business.name}</span>
              {' · '}{business.city}
            </p>
          </div>
        </div>

        {savedAt && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Product saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`p-5 sm:p-8 rounded-3xl border space-y-6 ${cardCls}`}>
          {/* Photo upload */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold uppercase ${labelCls}`}>Product Photo</label>
            <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border ${inputCls}`}>
              {imageUrl ? (
                <div className="relative shrink-0">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className={`w-28 h-28 rounded-2xl object-cover border ${
                      isDarkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    disabled={uploading || saving}
                    title="Remove photo"
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white border border-rose-300/50 shadow hover:bg-rose-400 transition cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-emerald-950 flex items-center justify-center shrink-0">
                  <ImagePlus className="w-7 h-7 text-emerald-400" />
                </div>
              )}

              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => document.getElementById('product-photo-input')?.click()}
                  disabled={uploading || saving}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed self-start ${
                    isDarkMode
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  <span>{uploading ? 'Uploading…' : imageUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                </button>
                <p className={`text-[10px] leading-snug ${subTextCls}`}>
                  JPG, PNG, WEBP or GIF · max 5 MB. A clear photo sells faster.
                </p>
                {uploadError && (
                  <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
            <input
              id="product-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                void handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label className={`text-xs font-bold uppercase ${labelCls}`}>Product Name *</label>
            <input
              type="text"
              placeholder="e.g. Kaptai Cotton 3-Piece Suit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
            />
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Price + discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-bold uppercase ${labelCls}`}>Price (PKR) *</label>
              <div className="relative mt-1.5">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black ${subTextCls}`}>
                  PKR
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="3500"
                  value={price}
                  onChange={handleMoneyChange(setPrice)}
                  className={`w-full p-3 pl-12 rounded-xl border text-xs ${inputCls}`}
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-400 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className={`text-xs font-bold uppercase ${labelCls}`}>
                Discount Price (optional)
              </label>
              <div className="relative mt-1.5">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black ${subTextCls}`}>
                  PKR
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2900"
                  value={discount}
                  onChange={handleMoneyChange(setDiscount)}
                  className={`w-full p-3 pl-12 rounded-xl border text-xs ${inputCls}`}
                />
              </div>
              {errors.discount ? (
                <p className="text-[11px] text-rose-400 mt-1">{errors.discount}</p>
              ) : (
                <p className={`text-[10px] mt-1 ${subTextCls}`}>
                  Must be lower than the original price — shown with a -% badge.
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`text-xs font-bold uppercase ${labelCls}`}>Description</label>
            <textarea
              rows={4}
              placeholder="Describe the product — material, sizes, colours, warranty…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
            />
          </div>

          {/* Availability toggle */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${inputCls}`}>
            <div>
              <div className="text-xs font-bold">Available for orders</div>
              <p className={`text-[10px] ${subTextCls}`}>
                Turn off to mark the product “Out of stock” on your storefront.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition cursor-pointer shrink-0 ${
                isAvailable ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => !saving && onClose()}
              disabled={saving}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60 ${
                isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving…' : product ? 'Save Changes' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
