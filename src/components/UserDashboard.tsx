import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, PlusCircle, BarChart3, Inbox, Sparkles, CheckCircle2,
  Clock, ArrowRight, CreditCard, Tag, Lock,
  Edit3, Trash2, X, Save, Package, Plus, Phone, Mail, AlertTriangle,
  MessageSquare, ShoppingBag, Loader2, Star, Eye, Users
} from 'lucide-react';
import {
  Business, LeadInquiry, User, CategoryItem, ProvinceRow, DistrictRow,
  CityRow, ChatConversation, Order, LeadStatus, OrderStatus, ProductOrService
} from '../types';
import {
  fetchCategories, fetchProvinces, fetchDistrictsByProvince, fetchCitiesByDistrict,
  updateLeadStatus, fetchUserConversations, fetchBusinessOrders, updateOrderStatus,
  createProduct, updateProduct, deleteProduct,
  formatDbDate, CreateBusinessInput
} from '../lib/supabaseDB';
import { validateBusinessInput, FieldErrors, sanitizeText, sanitizeMultiline } from '../lib/validation';
import { ImageUploadField } from './ImageUploadField';
import { ProductFormPage, ProductFormPayload } from './ProductFormPage';

interface UserDashboardProps {
  user: User | null;
  userBusinesses: Business[];
  leads: LeadInquiry[];
  onAddBusiness: (input: CreateBusinessInput) => Promise<{ success: boolean; error?: string }>;
  onUpdateBusiness: (id: string, patch: Partial<CreateBusinessInput>) => Promise<{ success: boolean; error?: string }>;
  onDeleteBusiness: (bizId: string) => Promise<void>;
  onUpgradeToBusiness: () => void;
  onOpenConversation: (conversation: ChatConversation) => void;
  /** Re-fetch owned businesses (incl. product lists) after product saves. */
  onRefreshBusinesses?: () => Promise<void>;
  isDarkMode: boolean;
}

interface ProductDraft {
  id: string;
  name: string;
  price: string;
  description: string;
}

type DashboardTab =
  | 'my-businesses'
  | 'add-business'
  | 'analytics'
  | 'leads'
  | 'conversations'
  | 'orders'
  | 'subscription';

/** Parse a free-form price string like "PKR 5,000" into a numeric PKR value. */
function parsePrice(input: string): number | undefined {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  suspended: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'ACTIVE',
  pending: 'PENDING APPROVAL',
  rejected: 'REJECTED',
  suspended: 'SUSPENDED',
};

const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  contacted: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  closed: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

const ORDER_FLOW: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];

/** Shared cascading Province → District → City selects fed from Supabase. */
const LocationSelects: React.FC<{
  provinces: ProvinceRow[];
  districts: DistrictRow[];
  cities: CityRow[];
  provinceId: string;
  districtId: string;
  cityId: string;
  onProvince: (id: string) => void;
  onDistrict: (id: string) => void;
  onCity: (id: string) => void;
  errors: FieldErrors;
  inputCls: string;
  labelCls: string;
}> = ({
  provinces, districts, cities, provinceId, districtId, cityId,
  onProvince, onDistrict, onCity, errors, inputCls, labelCls
}) => (
  <>
    <div>
      <label className={`text-xs font-bold uppercase ${labelCls}`}>Province *</label>
      <select
        value={provinceId}
        onChange={(e) => onProvince(e.target.value)}
        className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
      >
        <option value="">Select province</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      {errors.province && <p className="text-[11px] text-rose-400 mt-1">{errors.province}</p>}
    </div>

    <div>
      <label className={`text-xs font-bold uppercase ${labelCls}`}>District *</label>
      <select
        value={districtId}
        onChange={(e) => onDistrict(e.target.value)}
        disabled={!provinceId}
        className={`w-full mt-1.5 p-3 rounded-xl border text-xs disabled:opacity-50 ${inputCls}`}
      >
        <option value="">{provinceId ? 'Select district' : 'Select province first'}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      {errors.district && <p className="text-[11px] text-rose-400 mt-1">{errors.district}</p>}
    </div>

    <div>
      <label className={`text-xs font-bold uppercase ${labelCls}`}>City *</label>
      <select
        value={cityId}
        onChange={(e) => onCity(e.target.value)}
        disabled={!districtId}
        className={`w-full mt-1.5 p-3 rounded-xl border text-xs disabled:opacity-50 ${inputCls}`}
      >
        <option value="">{districtId ? 'Select city' : 'Select district first'}</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {errors.city && <p className="text-[11px] text-rose-400 mt-1">{errors.city}</p>}
    </div>
  </>
);

/** Products list editor used by both the Add form and the Edit modal. */
const ProductEditor: React.FC<{
  products: ProductDraft[];
  onChange: (items: ProductDraft[]) => void;
  isDarkMode: boolean;
}> = ({ products, onChange, isDarkMode }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');

  const addItem = () => {
    if (!name.trim()) return;
    onChange([
      ...products,
      {
        id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        price: price.trim(),
        description: desc.trim(),
      },
    ]);
    setName('');
    setPrice('');
    setDesc('');
  };

  return (
    <div className={`p-4 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
          <Package className="w-4 h-4" />
          <span>Products & Services</span>
        </label>
        <span className="text-[10px] text-slate-400">{products.length} items</span>
      </div>

      {products.length === 0 ? (
        <p className="text-[11px] text-slate-400">No products added yet. Add your first item below.</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {products.map((p) => (
            <div
              key={p.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {p.name} {p.price && <>— <span className="text-emerald-400">{p.price}</span></>}
                </div>
                {p.description && <div className="text-[11px] text-slate-400">{p.description}</div>}
              </div>
              <button
                type="button"
                onClick={() => onChange(products.filter((x) => x.id !== p.id))}
                className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                title="Remove item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`pt-2 border-t grid grid-cols-1 sm:grid-cols-3 gap-2 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <input
          type="text"
          placeholder="Item name (e.g. Lawn Design)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`p-2 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
        />
        <input
          type="text"
          placeholder="Price (e.g. PKR 5,000)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`p-2 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Short description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={`flex-1 p-2 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
          />
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  userBusinesses,
  leads,
  onAddBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onUpgradeToBusiness,
  onOpenConversation,
  onRefreshBusinesses,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('my-businesses');

  // ONE BUSINESS PER ACCOUNT: once the user owns a listing, every "add
  // business" entry point is hidden and replaced with a friendly notice.
  const oneBusinessLimitReached = userBusinesses.length >= 1;

  // ---------- Shared reference data (Supabase) ----------
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [provinces, setProvinces] = useState<ProvinceRow[]>([]);
  const [refDataError, setRefDataError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [catRes, provRes] = await Promise.all([fetchCategories(), fetchProvinces()]);
      if (cancelled) return;
      if (catRes.error || provRes.error) {
        setRefDataError(catRes.error || provRes.error || 'Could not load form data.');
        return;
      }
      setCategories(catRes.data || []);
      setProvinces(provRes.data || []);
    })();
    return () => { cancelled = true; };
  }, []);

  // ---------- Add Business form state ----------
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formProvinceId, setFormProvinceId] = useState('');
  const [formDistrictId, setFormDistrictId] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [formDistricts, setFormDistricts] = useState<DistrictRow[]>([]);
  const [formCities, setFormCities] = useState<CityRow[]>([]);
  const [formTagline, setFormTagline] = useState('');
  const [formHighlights, setFormHighlights] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formProducts, setFormProducts] = useState<ProductDraft[]>([]);
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [formServerError, setFormServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // AI loading indicators (add form)
  const [aiLoadingDesc, setAiLoadingDesc] = useState(false);
  const [aiLoadingTagline, setAiLoadingTagline] = useState(false);
  const [aiError, setAiError] = useState('');

  // Cascading loads for the add form
  useEffect(() => {
    if (!formProvinceId) { setFormDistricts([]); return; }
    fetchDistrictsByProvince(formProvinceId).then((r) => setFormDistricts(r.data || []));
  }, [formProvinceId]);

  useEffect(() => {
    if (!formDistrictId) { setFormCities([]); return; }
    fetchCitiesByDistrict(formDistrictId).then((r) => setFormCities(r.data || []));
  }, [formDistrictId]);

  // ---------- Edit modal state ----------
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editProvinceId, setEditProvinceId] = useState('');
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editCityId, setEditCityId] = useState('');
  const [editDistricts, setEditDistricts] = useState<DistrictRow[]>([]);
  const [editCities, setEditCities] = useState<CityRow[]>([]);
  const [editTagline, setEditTagline] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editOperatingHours, setEditOperatingHours] = useState('');
  const [editPriceRange, setEditPriceRange] = useState('');
  const [editProducts, setEditProducts] = useState<ProductDraft[]>([]);
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [editServerError, setEditServerError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [aiEditingDesc, setAiEditingDesc] = useState(false);
  const [aiEditingTagline, setAiEditingTagline] = useState(false);
  const [editAiError, setEditAiError] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Dedicated product management flow (full-screen page) ----------
  // productFormBiz: the business whose products are being managed;
  // productFormDraft: null = create, otherwise the product being edited.
  const [productFormBiz, setProductFormBiz] = useState<Business | null>(null);
  const [productFormDraft, setProductFormDraft] = useState<ProductOrService | null>(null);
  const [productDeleteId, setProductDeleteId] = useState<string | null>(null);
  const [productDeleting, setProductDeleting] = useState(false);
  const [productActionError, setProductActionError] = useState('');

  // Cascading loads for the edit modal
  useEffect(() => {
    if (!editProvinceId) { setEditDistricts([]); return; }
    fetchDistrictsByProvince(editProvinceId).then((r) => setEditDistricts(r.data || []));
  }, [editProvinceId]);

  useEffect(() => {
    if (!editDistrictId) { setEditCities([]); return; }
    fetchCitiesByDistrict(editDistrictId).then((r) => setEditCities(r.data || []));
  }, [editDistrictId]);

  // ---------- Leads (local copy so status updates reflect instantly) ----------
  const [leadItems, setLeadItems] = useState<LeadInquiry[]>(leads);
  const [leadActionError, setLeadActionError] = useState('');
  useEffect(() => setLeadItems(leads), [leads]);

  // ---------- Conversations ----------
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [convosLoading, setConvosLoading] = useState(false);
  const [convosError, setConvosError] = useState('');

  // ---------- Orders ----------
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (activeTab === 'conversations') void loadConversations();
    if (activeTab === 'orders') void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadConversations = async () => {
    setConvosLoading(true);
    setConvosError('');
    const { data, error } = await fetchUserConversations();
    setConvosLoading(false);
    if (error) { setConvosError(error); return; }
    setConversations(data || []);
  };

  const loadOrders = async () => {
    if (userBusinesses.length === 0) { setOrders([]); return; }
    setOrdersLoading(true);
    setOrdersError('');
    const results = await Promise.all(userBusinesses.map((b) => fetchBusinessOrders(b.id)));
    setOrdersLoading(false);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) { setOrdersError(firstError); return; }
    const all = results.flatMap((r) => r.data || []);
    all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    setOrders(all);
  };

  // ---------- Styling helpers ----------
  const cardCls = isDarkMode
    ? 'bg-[#0d1322] border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900';
  const inputCls = isDarkMode
    ? 'bg-slate-950 border-slate-800 text-white'
    : 'bg-slate-50 border-slate-300 text-slate-900';
  const labelCls = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const subTextCls = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const dividerCls = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  // ============================================================
  // UPGRADE GATE — regular user accounts cannot list businesses
  // ============================================================
  if (user && user.role === 'user') {
    return (
      <div className="py-16 px-4 sm:px-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase">
            User Account Restricted
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3">Business Management Requires a Business Account</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Your account (<strong>{user.email}</strong>) is currently a <strong>Regular User Account</strong>. Regular accounts can browse businesses, place orders, chat with owners, and leave reviews.
          </p>
        </div>

        <div className={`p-6 rounded-3xl border text-left space-y-3 ${cardCls}`}>
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to a Business Account in 1 click:</span>
          </h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>List and manage your business profiles across Pakistan</li>
            <li>Receive customer lead inquiries directly in your inbox</li>
            <li>Use 1-click Gemini AI to write descriptions & taglines</li>
            <li>Track real profile views, leads, and customer orders</li>
          </ul>

          <button
            onClick={onUpgradeToBusiness}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer mt-4"
          >
            <Building2 className="w-4 h-4" />
            <span>Upgrade My Account to Business Account Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // AI HELPERS — /api/gemini serverless endpoints. No fake fallbacks:
  // if the API fails we show an inline error and keep the field editable.
  // ============================================================
  const callGemini = async (
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) return null;
      return data as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  const nameFor = (id: string, list: { id: string; name: string }[]) =>
    list.find((x) => x.id === id)?.name || '';

  const handleGenerateAiDescription = async (forEdit: boolean) => {
    const name = forEdit ? editName : formName;
    const category = forEdit ? nameFor(editCategoryId, categories) : nameFor(formCategoryId, categories);
    const city = forEdit ? nameFor(editCityId, editCities) : nameFor(formCityId, formCities);
    if (!name.trim()) {
      (forEdit ? setEditAiError : setAiError)('Enter a business name first so AI can tailor the description.');
      return;
    }
    const setLoading = forEdit ? setAiEditingDesc : setAiLoadingDesc;
    const setErr = forEdit ? setEditAiError : setAiError;
    setErr('');
    setLoading(true);
    const data = await callGemini('/api/gemini/generate-description', {
      name: name.trim(),
      category: category || 'Local Business',
      city: city || 'Pakistan',
      keyHighlights: forEdit ? editTagline : (formHighlights || formTagline),
      targetAudience: 'Pakistani clients and consumers',
    });
    setLoading(false);
    const text = typeof data?.description === 'string' ? data.description.trim() : '';
    if (!text) {
      setErr('AI could not generate a description right now. Please try again or write one manually.');
      return;
    }
    (forEdit ? setEditDesc : setFormDesc)(text);
  };

  // Task 7.4 — unique per-business AI tagline (regeneratable)
  const handleGenerateAiTagline = async (forEdit: boolean) => {
    const name = forEdit ? editName : formName;
    const category = forEdit ? nameFor(editCategoryId, categories) : nameFor(formCategoryId, categories);
    const city = forEdit ? nameFor(editCityId, editCities) : nameFor(formCityId, formCities);
    if (!name.trim()) {
      (forEdit ? setEditAiError : setAiError)('Enter a business name first so AI can tailor the tagline.');
      return;
    }
    const setLoading = forEdit ? setAiEditingTagline : setAiLoadingTagline;
    const setErr = forEdit ? setEditAiError : setAiError;
    setErr('');
    setLoading(true);
    const data = await callGemini('/api/gemini/generate-description', {
      mode: 'tagline',
      name: name.trim(),
      category: category || 'Local Business',
      city: city || 'Pakistan',
      description: forEdit ? editDesc : formDesc,
      keyHighlights: forEdit ? '' : formHighlights,
    });
    setLoading(false);
    const text = typeof data?.description === 'string' ? data.description.trim() : '';
    if (!text) {
      setErr('AI could not generate a tagline right now. Please try again.');
      return;
    }
    (forEdit ? setEditTagline : setFormTagline)(text.replace(/^["']|["']$/g, ''));
  };

  // ============================================================
  // ADD BUSINESS — validated, owner_id comes from the auth session
  // ============================================================
  const resetAddForm = () => {
    setFormName('');
    setFormCategoryId('');
    setFormProvinceId('');
    setFormDistrictId('');
    setFormCityId('');
    setFormTagline('');
    setFormHighlights('');
    setFormDesc('');
    setFormPhone('');
    setFormWhatsapp('');
    setFormEmail('');
    setFormAddress('');
    setFormWebsite('');
    setFormHours('');
    setFormProducts([]);
    setFormLogoUrl('');
    setFormCoverUrl('');
    setFormErrors({});
    setFormServerError('');
  };

  const handleSubmitNewBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormServerError('');
    setAiError('');

    const errors = validateBusinessInput({
      name: formName,
      category: formCategoryId,
      province: formProvinceId,
      district: formDistrictId,
      city: formCityId,
      phone: formPhone,
      email: formEmail || user?.email || '',
      description: formDesc,
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    const input: CreateBusinessInput = {
      name: sanitizeText(formName, 100),
      tagline: formTagline.trim() ? sanitizeText(formTagline, 150) : undefined,
      description: sanitizeMultiline(formDesc, 3000),
      categoryId: formCategoryId,
      provinceId: formProvinceId,
      districtId: formDistrictId,
      cityId: formCityId,
      phone: formPhone.trim(),
      whatsapp: formWhatsapp.trim() || undefined,
      email: (formEmail || user?.email || '').trim(),
      website: formWebsite.trim() || undefined,
      fullAddress: formAddress.trim() ? sanitizeText(formAddress, 300) : undefined,
      operatingHours: formHours.trim() || undefined,
      logoUrl: formLogoUrl.trim() || undefined,
      coverUrl: formCoverUrl.trim() || undefined,
      products: formProducts.map((p) => ({
        name: sanitizeText(p.name, 120),
        description: sanitizeText(p.description || 'Quality offering.', 300),
        price: parsePrice(p.price),
      })),
    };

    const result = await onAddBusiness(input);
    setSubmitting(false);

    if (!result.success) {
      setFormServerError(result.error || 'Could not create the listing. Please try again.');
      return;
    }

    resetAddForm();
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setActiveTab('my-businesses');
    }, 2500);
  };

  // ============================================================
  // EDIT BUSINESS
  // ============================================================
  const handleStartEdit = (biz: Business) => {
    setEditingBiz(biz);
    setEditName(biz.name);
    setEditCategoryId(biz.categoryId || '');
    setEditProvinceId(biz.provinceId || '');
    setEditDistrictId(biz.districtId || '');
    setEditCityId(biz.cityId || '');
    setEditTagline(biz.tagline || '');
    setEditDesc(biz.description || '');
    setEditPhone(biz.phone || '');
    setEditWhatsapp(biz.whatsapp || '');
    setEditEmail(biz.email || '');
    setEditAddress(biz.address || '');
    setEditWebsite(biz.website || '');
    setEditOperatingHours(biz.operatingHours || '');
    setEditPriceRange(biz.priceRange || '');
    setEditLogoUrl(biz.logoImage || '');
    setEditCoverUrl(biz.coverImage || '');
    setEditProducts(
      (biz.productsServices || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price || '',
        description: p.description || '',
      }))
    );
    setEditErrors({});
    setEditServerError('');
    setEditAiError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;
    setEditServerError('');

    const errors = validateBusinessInput({
      name: editName,
      category: editCategoryId,
      province: editProvinceId,
      district: editDistrictId,
      city: editCityId,
      phone: editPhone,
      email: editEmail || user?.email || '',
      description: editDesc,
    });
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingEdit(true);
    const patch: Partial<CreateBusinessInput> = {
      name: sanitizeText(editName, 100),
      tagline: editTagline.trim() ? sanitizeText(editTagline, 150) : '',
      description: sanitizeMultiline(editDesc, 3000),
      categoryId: editCategoryId,
      provinceId: editProvinceId,
      districtId: editDistrictId,
      cityId: editCityId,
      phone: editPhone.trim(),
      whatsapp: editWhatsapp.trim(),
      email: (editEmail || user?.email || '').trim(),
      website: editWebsite.trim(),
      fullAddress: editAddress.trim() ? sanitizeText(editAddress, 300) : '',
      operatingHours: editOperatingHours.trim(),
      priceRange: editPriceRange.trim(),
      logoUrl: editLogoUrl.trim(),
      coverUrl: editCoverUrl.trim(),
      products: editProducts.map((p) => ({
        // Real product ids let updateBusiness sync in place (preserving
        // photos/discounts); 'draft-' ids insert as brand-new rows.
        id: p.id.startsWith('draft-') ? undefined : p.id,
        name: sanitizeText(p.name, 120),
        description: sanitizeText(p.description || 'Quality offering.', 300),
        price: parsePrice(p.price),
      })),
    };

    const result = await onUpdateBusiness(editingBiz.id, patch);
    setSavingEdit(false);

    if (!result.success) {
      setEditServerError(result.error || 'Could not save changes. Please try again.');
      return;
    }

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setEditingBiz(null);
    }, 1200);
  };

  const handleConfirmDelete = async (bizId: string) => {
    setDeleting(true);
    await onDeleteBusiness(bizId);
    setDeleting(false);
    setDeleteConfirmId(null);
    if (editingBiz?.id === bizId) setEditingBiz(null);
  };

  // ============================================================
  // DEDICATED PRODUCT MANAGEMENT (full-screen Add/Edit Product page)
  // Saves go straight to business_products; afterwards the owned
  // businesses (incl. products) are re-fetched so every list stays fresh.
  // ============================================================
  const handleSaveProduct = async (
    payload: ProductFormPayload
  ): Promise<{ success: boolean; error?: string }> => {
    if (!productFormBiz) return { success: false, error: 'No business selected.' };
    setProductActionError('');

    const result = productFormDraft
      ? await updateProduct(productFormDraft.id, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          discountPrice: payload.discountPrice,
          imageUrl: payload.imageUrl,
          isAvailable: payload.isAvailable,
        })
      : await createProduct(productFormBiz.id, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          discountPrice: payload.discountPrice,
          imageUrl: payload.imageUrl,
          isAvailable: payload.isAvailable,
        });

    if (result.error) return { success: false, error: result.error };

    if (onRefreshBusinesses) await onRefreshBusinesses();
    return { success: true };
  };

  const handleConfirmDeleteProduct = async (productId: string) => {
    setProductDeleting(true);
    setProductActionError('');
    const { error } = await deleteProduct(productId);
    setProductDeleting(false);
    setProductDeleteId(null);
    if (error) {
      setProductActionError(error);
      return;
    }
    if (onRefreshBusinesses) await onRefreshBusinesses();
  };

  // ============================================================
  // LEADS
  // ============================================================
  const handleLeadStatusChange = async (leadId: string, status: LeadStatus) => {
    setLeadActionError('');
    const { error } = await updateLeadStatus(leadId, status);
    if (error) { setLeadActionError(error); return; }
    setLeadItems((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  // ============================================================
  // ORDERS
  // ============================================================
  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setOrdersError('');
    const { error } = await updateOrderStatus(orderId, status);
    if (error) { setOrdersError(error); return; }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o)));
  };

  // ============================================================
  // REAL ANALYTICS — computed only from real DB-backed data
  // ============================================================
  const totalViews = userBusinesses.reduce((sum, b) => sum + (b.viewsCount || 0), 0);
  const totalLeads = userBusinesses.reduce((sum, b) => sum + (b.leadsCount || 0), 0);
  const rated = userBusinesses.filter((b) => b.rating > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
    : 0;
  const totalReviews = userBusinesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0);

  const tabBtn = (tab: DashboardTab) =>
    `px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
      activeTab === tab
        ? isDarkMode
          ? 'bg-emerald-500 text-slate-950 shadow-md'
          : 'bg-slate-900 text-white shadow-sm'
        : isDarkMode
          ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
    }`;

  return (
    <div className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardCls} ${isDarkMode ? '' : 'shadow-md'}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>BizNest Merchant Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Business Dashboard</h1>
          <p className={`text-xs sm:text-sm ${subTextCls}`}>Manage your listings, generate AI profiles, track real inquiries, orders, and conversations.</p>
        </div>

        {oneBusinessLimitReached ? (
          <div className={`px-5 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isDarkMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="max-w-[240px] leading-snug">
              One business per account — you're managing{' '}
              <strong>{userBusinesses[0]?.name || 'your listing'}</strong>
            </span>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('add-business')}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Business Listing</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button onClick={() => setActiveTab('my-businesses')} className={tabBtn('my-businesses')}>
          <Building2 className="w-4 h-4" />
          <span>My Listings ({userBusinesses.length})</span>
        </button>
        {!oneBusinessLimitReached && (
          <button onClick={() => setActiveTab('add-business')} className={tabBtn('add-business')}>
            <PlusCircle className="w-4 h-4" />
            <span>Add Business + AI</span>
          </button>
        )}
        <button onClick={() => setActiveTab('analytics')} className={tabBtn('analytics')}>
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button onClick={() => setActiveTab('leads')} className={tabBtn('leads')}>
          <Inbox className="w-4 h-4" />
          <span>Leads ({leadItems.length})</span>
        </button>
        <button onClick={() => setActiveTab('conversations')} className={tabBtn('conversations')}>
          <MessageSquare className="w-4 h-4" />
          <span>Conversations</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={tabBtn('orders')}>
          <ShoppingBag className="w-4 h-4" />
          <span>Orders</span>
        </button>
        <button onClick={() => setActiveTab('subscription')} className={tabBtn('subscription')}>
          <CreditCard className="w-4 h-4" />
          <span>Subscription</span>
        </button>
      </div>

      {/* ================= 1. MY BUSINESSES ================= */}
      {activeTab === 'my-businesses' && (
        <div className="space-y-4">
          {userBusinesses.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-4 ${cardCls}`}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">You haven't listed any business yet.</h3>
              <p className={`text-xs max-w-md mx-auto ${subTextCls}`}>
                Create your first listing to start receiving customer inquiries, orders, and reviews from across Pakistan.
              </p>
              <button
                onClick={() => setActiveTab('add-business')}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your First Business</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBusinesses.map((biz) => (
                <div key={biz.id} className={`p-5 rounded-3xl border flex flex-col justify-between ${cardCls}`}>
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {biz.logoImage ? (
                          <img src={biz.logoImage} alt={biz.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-base font-bold truncate">{biz.name}</h3>
                          <p className={`text-xs truncate ${subTextCls}`}>{biz.category} • {biz.city}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${STATUS_BADGE[biz.status] || STATUS_BADGE.pending}`}>
                        {STATUS_LABEL[biz.status] || biz.status}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-2 my-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{biz.description}</p>

                    {/* REAL stats only — views, leads, rating, reviews */}
                    <div className={`grid grid-cols-4 gap-2 my-3 text-center p-2.5 rounded-2xl border text-xs font-bold ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className={`text-[10px] uppercase ${subTextCls}`}>Views</div>
                        <div className="text-cyan-400">{biz.viewsCount || 0}</div>
                      </div>
                      <div>
                        <div className={`text-[10px] uppercase ${subTextCls}`}>Leads</div>
                        <div className="text-purple-400">{biz.leadsCount || 0}</div>
                      </div>
                      <div>
                        <div className={`text-[10px] uppercase ${subTextCls}`}>Rating</div>
                        <div className="text-amber-400">{biz.rating > 0 ? biz.rating.toFixed(1) : '—'}</div>
                      </div>
                      <div>
                        <div className={`text-[10px] uppercase ${subTextCls}`}>Reviews</div>
                        <div className="text-emerald-400">{biz.reviewCount || 0}</div>
                      </div>
                    </div>

                    {/* ===== Product management (dedicated + flow) ===== */}
                    <div className={`mt-3 p-3 rounded-2xl border space-y-2.5 ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-extrabold uppercase flex items-center gap-1.5 ${subTextCls}`}>
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span>Products ({biz.productsServices.length})</span>
                        </span>
                        <button
                          onClick={() => {
                            setProductFormBiz(biz);
                            setProductFormDraft(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-[11px] shadow flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Product</span>
                        </button>
                      </div>

                      {productActionError && (
                        <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {productActionError}
                        </p>
                      )}

                      {biz.productsServices.length === 0 ? (
                        <p className={`text-[11px] ${subTextCls}`}>
                          No products yet. Tap <strong>+ Add Product</strong> to create your first
                          listing with a photo, price and optional discount.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {biz.productsServices.map((p) => {
                            const hasDiscount =
                              p.discountPrice != null &&
                              p.numericPrice != null &&
                              p.discountPrice > 0 &&
                              p.discountPrice < p.numericPrice;
                            const pct = hasDiscount
                              ? Math.round((1 - p.discountPrice! / p.numericPrice!) * 100)
                              : 0;
                            return (
                              <div
                                key={p.id}
                                className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                                  isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                                }`}
                              >
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-700/60 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-emerald-950 flex items-center justify-center shrink-0">
                                    <Package className="w-4 h-4 text-emerald-400" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                    <span className={`truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</span>
                                    {p.isAvailable === false && (
                                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[9px] font-black uppercase">
                                        Out of stock
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] flex items-center gap-1.5 flex-wrap">
                                    {p.numericPrice != null ? (
                                      <span className={`font-bold ${hasDiscount ? 'line-through opacity-60' : 'text-emerald-400'}`}>
                                        PKR {p.numericPrice.toLocaleString('en-PK')}
                                      </span>
                                    ) : (
                                      <span className={subTextCls}>Price on inquiry</span>
                                    )}
                                    {hasDiscount && (
                                      <>
                                        <span className="font-bold text-emerald-400">
                                          PKR {p.discountPrice!.toLocaleString('en-PK')}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-black">
                                          -{pct}%
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      setProductFormBiz(biz);
                                      setProductFormDraft(p);
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                                    title={`Edit ${p.name}`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setProductActionError('');
                                      setProductDeleteId(p.id);
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                                    title={`Delete ${p.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${dividerCls}`}>
                    <span className={`${subTextCls} flex items-center gap-1`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Listed: {formatDbDate(biz.createdAt) || '—'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(biz)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(biz.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                        title="Delete Business"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 2. ADD BUSINESS ================= */}
      {activeTab === 'add-business' && oneBusinessLimitReached && (
        <div className={`p-10 rounded-3xl border text-center space-y-4 ${cardCls}`}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold">One business per account</h3>
          <p className={`text-xs max-w-md mx-auto leading-relaxed ${subTextCls}`}>
            Each BizNest account manages a single business listing. You're already managing{' '}
            <strong className="text-emerald-400">{userBusinesses[0]?.name}</strong> — open{' '}
            <strong>My Listings</strong> to edit its details, products, photos and more. To list a
            different business, delete the current listing first.
          </p>
          <button
            onClick={() => setActiveTab('my-businesses')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer inline-flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Go to My Listing</span>
          </button>
        </div>
      )}

      {activeTab === 'add-business' && !oneBusinessLimitReached && (
        <div className={`p-6 sm:p-8 rounded-3xl border ${cardCls}`}>
          <div className={`mb-6 pb-4 border-b ${dividerCls}`}>
            <h2 className="text-xl font-extrabold">List Your Business on BizNest</h2>
            <p className={`text-xs mt-0.5 ${subTextCls}`}>
              Use the built-in 1-click Gemini AI assistant to write a unique description and tagline for your business.
            </p>
          </div>

          {addedSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>Business listing created successfully! It is now pending admin review before going live.</span>
            </div>
          ) : refDataError ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm space-y-3">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{refDataError}</span>
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitNewBusiness} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Botanical Nursery"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-[11px] text-rose-400 mt-1">{formErrors.category}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LocationSelects
                  provinces={provinces}
                  districts={formDistricts}
                  cities={formCities}
                  provinceId={formProvinceId}
                  districtId={formDistrictId}
                  cityId={formCityId}
                  onProvince={(id) => { setFormProvinceId(id); setFormDistrictId(''); setFormCityId(''); }}
                  onDistrict={(id) => { setFormDistrictId(id); setFormCityId(''); }}
                  onCity={setFormCityId}
                  errors={formErrors}
                  inputCls={inputCls}
                  labelCls={labelCls}
                />
              </div>

              {/* Tagline with unique AI generation */}
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Tagline (unique per business)</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiTagline(false)}
                    disabled={aiLoadingTagline}
                    className="px-3 py-1 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {aiLoadingTagline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                    <span>{aiLoadingTagline ? 'Writing tagline...' : '✨ Generate AI Tagline'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Exotic plants & landscaping in DHA Phase 5"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs ${inputCls}`}
                />
                <p className={`text-[10px] mt-1 ${subTextCls}`}>Leave empty and AI will write a unique tagline automatically after publishing.</p>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase ${labelCls}`}>Key Highlights (helps AI write better)</label>
                <input
                  type="text"
                  placeholder="e.g. 24/7 delivery, 20 years experience, organic fertilizers"
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                />
              </div>

              {/* Description with AI */}
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Business Description * (min 50 characters)</label>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiDescription(false)}
                    disabled={aiLoadingDesc}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-extrabold text-[11px] shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {aiLoadingDesc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{aiLoadingDesc ? 'Writing Description...' : '✨ Auto-Generate with Gemini AI'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe your business, services, and pricing — or click the AI button above to draft one instantly."
                  className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:border-purple-500 ${inputCls}`}
                />
                {formErrors.description && <p className="text-[11px] text-rose-400 mt-1">{formErrors.description}</p>}
                {aiError && <p className="text-[11px] text-amber-400 mt-1">{aiError}</p>}
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Phone Number *</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-400 mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>WhatsApp Number</label>
                  <input
                    type="text"
                    placeholder="+923001234567"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Email Address *</label>
                  <input
                    type="email"
                    placeholder={user?.email || 'info@business.pk'}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                  {formErrors.email && <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Full Address</label>
                  <input
                    type="text"
                    placeholder="Street, area, city"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Operating Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 08:00 PM"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase ${labelCls}`}>Website (optional)</label>
                <input
                  type="text"
                  placeholder="https://yourbusiness.pk"
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                />
              </div>

              {/* Business images (Supabase Storage) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadField
                  label="Business Logo"
                  hint="Square image looks best · JPG/PNG/WEBP/GIF · max 5 MB"
                  bucket="business-images"
                  nameHint="logo"
                  value={formLogoUrl}
                  onChange={setFormLogoUrl}
                  isDarkMode={isDarkMode}
                  previewClassName="w-20 h-20 rounded-2xl"
                />
                <ImageUploadField
                  label="Cover Image"
                  hint="Wide banner image for your storefront · max 5 MB"
                  bucket="business-images"
                  nameHint="cover"
                  value={formCoverUrl}
                  onChange={setFormCoverUrl}
                  isDarkMode={isDarkMode}
                  previewClassName="w-20 h-20 rounded-2xl"
                />
              </div>

              <ProductEditor products={formProducts} onChange={setFormProducts} isDarkMode={isDarkMode} />

              {formServerError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formServerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>{submitting ? 'Publishing Listing...' : 'Publish Listing to BizNest'}</span>
              </button>

              <p className={`text-[10px] text-center ${subTextCls}`}>
                New listings are reviewed by the BizNest admin team before appearing publicly.
              </p>
            </form>
          )}
        </div>
      )}

      {/* ================= 3. ANALYTICS (REAL DATA ONLY) ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {userBusinesses.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-3 ${cardCls}`}>
              <BarChart3 className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold">No analytics yet</h3>
              <p className={`text-xs max-w-md mx-auto ${subTextCls}`}>
                Analytics are generated from your real listings once you publish your first business.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-3xl border ${cardCls}`}>
                  <div className={`text-xs font-bold uppercase flex items-center gap-1.5 ${subTextCls}`}>
                    <Eye className="w-3.5 h-3.5" /><span>Profile Views</span>
                  </div>
                  <div className="text-3xl font-black text-cyan-400 mt-1">{totalViews.toLocaleString()}</div>
                </div>
                <div className={`p-5 rounded-3xl border ${cardCls}`}>
                  <div className={`text-xs font-bold uppercase flex items-center gap-1.5 ${subTextCls}`}>
                    <Users className="w-3.5 h-3.5" /><span>Total Leads</span>
                  </div>
                  <div className="text-3xl font-black text-purple-400 mt-1">{totalLeads.toLocaleString()}</div>
                </div>
                <div className={`p-5 rounded-3xl border ${cardCls}`}>
                  <div className={`text-xs font-bold uppercase flex items-center gap-1.5 ${subTextCls}`}>
                    <Star className="w-3.5 h-3.5" /><span>Avg Rating</span>
                  </div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
                </div>
                <div className={`p-5 rounded-3xl border ${cardCls}`}>
                  <div className={`text-xs font-bold uppercase flex items-center gap-1.5 ${subTextCls}`}>
                    <MessageSquare className="w-3.5 h-3.5" /><span>Total Reviews</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 mt-1">{totalReviews.toLocaleString()}</div>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border ${cardCls}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${labelCls}`}>Per-Listing Performance</h3>
                <div className="space-y-2">
                  {userBusinesses.map((biz) => {
                    const maxViews = Math.max(...userBusinesses.map((b) => b.viewsCount || 0), 1);
                    const pct = Math.round(((biz.viewsCount || 0) / maxViews) * 100);
                    return (
                      <div key={biz.id} className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold truncate">{biz.name}</span>
                          <span className={`shrink-0 ${subTextCls}`}>
                            {biz.viewsCount || 0} views • {biz.leadsCount || 0} leads • {biz.rating > 0 ? `${biz.rating.toFixed(1)}★` : 'No ratings'}
                          </span>
                        </div>
                        <div className={`mt-2 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-cyan-400"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 4. LEADS INBOX ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Customer Inquiry Inbox ({leadItems.length})</h2>
          {leadActionError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
              {leadActionError}
            </div>
          )}
          {leadItems.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-3 ${cardCls}`}>
              <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold">No inquiries received yet.</h3>
              <p className={`text-xs max-w-md mx-auto ${subTextCls}`}>
                Customer inquiries about your listings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leadItems.map((l) => (
                <div key={l.id} className={`p-5 rounded-3xl border space-y-2 ${cardCls}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-bold text-emerald-400 text-sm">
                      {l.senderName}{l.city ? ` (${l.city})` : ''}
                      <span className={`ml-2 font-normal ${subTextCls}`}>→ {l.businessName}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${LEAD_STATUS_BADGE[l.status] || LEAD_STATUS_BADGE.new}`}>
                      {l.status}
                    </span>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{l.message}</div>
                  <div className={`flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] pt-2 border-t ${subTextCls} ${dividerCls}`}>
                    {l.senderPhone && <span>Phone: {l.senderPhone}</span>}
                    {l.senderEmail && <span>Email: {l.senderEmail}</span>}
                    <span>Date: {l.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {(['new', 'contacted', 'closed'] as LeadStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleLeadStatusChange(l.id, s)}
                        disabled={l.status === s}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition cursor-pointer disabled:cursor-default ${
                          l.status === s
                            ? LEAD_STATUS_BADGE[s]
                            : isDarkMode
                              ? 'border-slate-700 text-slate-400 hover:text-white'
                              : 'border-slate-300 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 5. CONVERSATIONS ================= */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Customer Conversations</h2>
          {convosLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            </div>
          ) : convosError ? (
            <div className={`p-6 rounded-3xl border text-center space-y-3 ${cardCls}`}>
              <p className="text-rose-400 text-sm font-bold">{convosError}</p>
              <button
                onClick={loadConversations}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-3 ${cardCls}`}>
              <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold">No conversations yet.</h3>
              <p className={`text-xs max-w-md mx-auto ${subTextCls}`}>
                When customers message your business through BizNest chat, the conversation will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${cardCls}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{c.customerName || 'Customer'}</div>
                    <div className={`text-xs truncate ${subTextCls}`}>
                      {c.businessName && <span className="text-emerald-400">{c.businessName} • </span>}
                      {c.lastMessage || 'No messages yet.'}
                    </div>
                    <div className={`text-[10px] mt-1 ${subTextCls}`}>{c.lastUpdated}</div>
                  </div>
                  <button
                    onClick={() => onOpenConversation(c)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 6. ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Orders Received</h2>
          {ordersLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            </div>
          ) : orders.length === 0 && !ordersError ? (
            <div className={`p-10 rounded-3xl border text-center space-y-3 ${cardCls}`}>
              <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold">No orders yet.</h3>
              <p className={`text-xs max-w-md mx-auto ${subTextCls}`}>
                Orders placed on your products will appear here so you can fulfil them.
              </p>
            </div>
          ) : (
            <>
              {ordersError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                  {ordersError}
                </div>
              )}
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className={`p-5 rounded-3xl border space-y-3 ${cardCls}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-bold text-sm">
                        {o.userName}
                        <span className={`ml-2 font-normal text-xs ${subTextCls}`}>{o.businessName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase">
                          payment: {o.paymentStatus}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div className={`text-xs space-y-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-2">
                          <span>{item.quantity} × {item.productName}</span>
                          <span>{item.formattedPrice}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] pt-2 border-t ${subTextCls} ${dividerCls}`}>
                      <span className="font-bold text-emerald-400">Total: PKR {o.totalAmount.toLocaleString()}</span>
                      {o.userPhone && <span>Phone: {o.userPhone}</span>}
                      <span>{o.address}{o.city ? `, ${o.city}` : ''}</span>
                      <span>{o.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ORDER_FLOW.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleOrderStatusChange(o.id, s)}
                          disabled={o.orderStatus === s || o.orderStatus === 'delivered' || o.orderStatus === 'cancelled'}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition cursor-pointer disabled:cursor-default ${
                            o.orderStatus === s
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isDarkMode
                                ? 'border-slate-700 text-slate-400 hover:text-white disabled:opacity-40'
                                : 'border-slate-300 text-slate-500 hover:text-slate-900 disabled:opacity-40'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      {o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered' && (
                        <button
                          onClick={() => handleOrderStatusChange(o.id, 'cancelled')}
                          className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 7. SUBSCRIPTION PLAN ================= */}
      {activeTab === 'subscription' && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${isDarkMode ? 'bg-[#0d1322] border-emerald-500/40 text-white' : 'bg-white border-emerald-300 text-slate-900'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${dividerCls}`}>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  100% Free Launch Access
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                  Premium Tiers Coming Soon
                </span>
              </div>
              <h2 className="text-xl font-extrabold mt-2">Merchant Launch Status</h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                All features, AI tools, and lead channels are unlocked for free during launch.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>UNLOCKED LAUNCH PLAN</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`font-bold uppercase text-[10px] ${subTextCls}`}>Current Billing Rate</div>
              <div className="text-2xl font-black text-emerald-400">PKR 0 <span className={`text-xs font-normal ${subTextCls}`}>/ Free Launch</span></div>
            </div>
            <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`font-bold uppercase text-[10px]`}>Premium Plans Status</div>
              <div className="text-base font-bold text-amber-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-4 h-4" />
                <span>Coming Soon (Under Development)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
            ✨ <strong>Join early with zero risk:</strong> To support local business owners across Pakistan, BizNest provides the 1-click AI copywriter, direct customer inquiries, and multi-city listings at 0 PKR cost during our official launch.
          </div>
        </div>
      )}

      {/* ================= EDIT BUSINESS MODAL ================= */}
      <AnimatePresence>
        {editingBiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${cardCls}`}
            >
              <div className={`flex items-center justify-between pb-4 mb-6 border-b ${dividerCls}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">Edit Business Listing</h2>
                    <p className={`text-xs ${subTextCls}`}>Update details, contact info, products & services.</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingBiz(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Changes saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Business Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                    {editErrors.name && <p className="text-[11px] text-rose-400 mt-1">{editErrors.name}</p>}
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Category *</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {editErrors.category && <p className="text-[11px] text-rose-400 mt-1">{editErrors.category}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <LocationSelects
                    provinces={provinces}
                    districts={editDistricts}
                    cities={editCities}
                    provinceId={editProvinceId}
                    districtId={editDistrictId}
                    cityId={editCityId}
                    onProvince={(id) => { setEditProvinceId(id); setEditDistrictId(''); setEditCityId(''); }}
                    onDistrict={(id) => { setEditDistrictId(id); setEditCityId(''); }}
                    onCity={setEditCityId}
                    errors={editErrors}
                    inputCls={inputCls}
                    labelCls={labelCls}
                  />
                </div>

                {/* Tagline + Regenerate AI Tagline (Task 7.4) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Tagline</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiTagline(true)}
                      disabled={aiEditingTagline}
                      className="px-3 py-1 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {aiEditingTagline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                      <span>{aiEditingTagline ? 'Regenerating...' : '✨ Regenerate AI Tagline'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Full Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>

                {/* Description + AI rewrite */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Business Description * (min 50 characters)</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateAiDescription(true)}
                      disabled={aiEditingDesc}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-extrabold text-[11px] shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {aiEditingDesc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{aiEditingDesc ? 'Rewriting...' : '✨ Rewrite with Gemini AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className={`w-full p-3.5 rounded-xl border text-xs focus:outline-none focus:border-purple-500 ${inputCls}`}
                  />
                  {editErrors.description && <p className="text-[11px] text-rose-400 mt-1">{editErrors.description}</p>}
                  {editAiError && <p className="text-[11px] text-amber-400 mt-1">{editAiError}</p>}
                </div>

                {/* Optional details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Operating Hours</label>
                    <input
                      type="text"
                      value={editOperatingHours}
                      onChange={(e) => setEditOperatingHours(e.target.value)}
                      placeholder="e.g. 09:00 AM - 08:00 PM"
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls}`}>Price Range</label>
                    <input
                      type="text"
                      value={editPriceRange}
                      onChange={(e) => setEditPriceRange(e.target.value)}
                      placeholder="e.g. PKR 500 - 5,000"
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                  </div>
                </div>

                {/* Contact & links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls} flex items-center gap-1`}>
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Phone *</span>
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                    {editErrors.phone && <p className="text-[11px] text-rose-400 mt-1">{editErrors.phone}</p>}
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls} flex items-center gap-1`}>
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase ${labelCls} flex items-center gap-1`}>
                      <Mail className="w-3 h-3 text-emerald-400" />
                      <span>Email *</span>
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                    />
                    {editErrors.email && <p className="text-[11px] text-rose-400 mt-1">{editErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase ${labelCls}`}>Website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://yourbusiness.pk"
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs ${inputCls}`}
                  />
                </div>

                {/* Business images (Supabase Storage) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageUploadField
                    label="Business Logo"
                    hint="Square image looks best · JPG/PNG/WEBP/GIF · max 5 MB"
                    bucket="business-images"
                    nameHint="logo"
                    value={editLogoUrl}
                    onChange={setEditLogoUrl}
                    isDarkMode={isDarkMode}
                    previewClassName="w-20 h-20 rounded-2xl"
                  />
                  <ImageUploadField
                    label="Cover Image"
                    hint="Wide banner image for your storefront · max 5 MB"
                    bucket="business-images"
                    nameHint="cover"
                    value={editCoverUrl}
                    onChange={setEditCoverUrl}
                    isDarkMode={isDarkMode}
                    previewClassName="w-20 h-20 rounded-2xl"
                  />
                </div>

                <ProductEditor products={editProducts} onChange={setEditProducts} isDarkMode={isDarkMode} />

                {editServerError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{editServerError}</span>
                  </div>
                )}

                {/* Footer buttons */}
                <div className={`pt-4 border-t flex items-center justify-between gap-3 flex-wrap ${dividerCls}`}>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(editingBiz.id)}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Listing</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingBiz(null)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer disabled:opacity-60"
                    >
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-rose-500/30 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-lg font-black">Delete Business Listing?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove this business listing from BizNest? This action cannot be undone and will also remove its products, leads, and inquiry history.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirmId)}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DEDICATED PRODUCT FORM PAGE (full-screen) ================= */}
      {productFormBiz && (
        <ProductFormPage
          business={productFormBiz}
          product={productFormDraft}
          isDarkMode={isDarkMode}
          onSave={handleSaveProduct}
          onClose={() => {
            setProductFormBiz(null);
            setProductFormDraft(null);
          }}
        />
      )}

      {/* ================= PRODUCT DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {productDeleteId && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-rose-500/30 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-lg font-black">Delete Product?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This permanently removes the product from your storefront, including its photo,
                price and discount. Customers will no longer see it.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setProductDeleteId(null)}
                  disabled={productDeleting}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDeleteProduct(productDeleteId)}
                  disabled={productDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {productDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{productDeleting ? 'Deleting…' : 'Confirm Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
