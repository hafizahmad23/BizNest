import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, PlusCircle, BarChart3, Inbox, Sparkles, CheckCircle2, 
  Search, ShieldCheck, Clock, Users, ArrowUpRight, Check, CreditCard, Tag, User as UserIcon, Lock, ArrowRight,
  Edit3, Trash2, X, Save, Package, Plus, Globe, Phone, Mail, MapPin, DollarSign, AlertTriangle
} from 'lucide-react';
import { Business, LeadInquiry, User } from '../types';

interface UserDashboardProps {
  user: User | null;
  userBusinesses: Business[];
  leads: LeadInquiry[];
  onAddBusiness: (newBiz: Partial<Business>) => void;
  onUpdateBusiness?: (updatedBiz: Business) => void;
  onDeleteBusiness?: (bizId: string) => void;
  onUpgradeToBusiness: () => void;
  isDarkMode: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  userBusinesses,
  leads,
  onAddBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onUpgradeToBusiness,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'my-businesses' | 'add-business' | 'analytics' | 'leads' | 'subscription'>('my-businesses');

  // Form State for Add Business
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Nursery');
  const [formCity, setFormCity] = useState('Lahore');
  const [formTagline, setFormTagline] = useState('');
  const [formHighlights, setFormHighlights] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formKeywords, setFormKeywords] = useState<string[]>([]);

  // AI Loading indicators
  const [aiLoadingDesc, setAiLoadingDesc] = useState(false);
  const [aiLoadingKw, setAiLoadingKw] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // EDITING BUSINESS STATE
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editOperatingHours, setEditOperatingHours] = useState('');
  const [editPriceRange, setEditPriceRange] =
  useState<Business['priceRange']>('PKR 💸💸');
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [editProducts, setEditProducts] = useState<NonNullable<Business['productsServices']>>([]);

  // Product add state in edit modal
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  const [aiEditingDesc, setAiEditingDesc] = useState(false);
  const [aiEditingKw, setAiEditingKw] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleStartEdit = (biz: Business) => {
    setEditingBiz(biz);
    setEditName(biz.name);
    setEditCategory(biz.category);
    setEditCity(biz.city);
    setEditTagline(biz.tagline || '');
    setEditDesc(biz.description || '');
    setEditPhone(biz.phone || '');
    setEditWhatsapp(biz.whatsapp || '');
    setEditEmail(biz.email || '');
    setEditAddress(biz.address || '');
    setEditWebsite(biz.website || '');
    setEditOperatingHours(biz.operatingHours || '09:00 AM - 08:00 PM');
    setEditPriceRange(biz.priceRange || 'PKR 💸💸');
    setEditKeywords(biz.aiKeywords || [biz.category, biz.city, biz.name]);
    setEditProducts(biz.productsServices ? [...biz.productsServices] : []);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;

    const updated: Business = {
      ...editingBiz,
      name: editName,
      category: editCategory,
      city: editCity,
      tagline: editTagline,
      description: editDesc,
      phone: editPhone,
      whatsapp: editWhatsapp,
      email: editEmail,
      address: editAddress || `${editCity}, Pakistan`,
      website: editWebsite,
      operatingHours: editOperatingHours,
      priceRange: editPriceRange,
      aiKeywords: editKeywords,
      productsServices: editProducts
    };

    if (onUpdateBusiness) {
      onUpdateBusiness(updated);
    }

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setEditingBiz(null);
    }, 1500);
  };

  const handleAddProductToEdit = () => {
    if (!newProdName.trim()) return;
    const p = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      price: newProdPrice.trim() || 'Contact for Price',
      description: newProdDesc.trim() || 'High quality offering.'
    };
    setEditProducts(prev => [...prev, p]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
  };

  const handleRemoveProductFromEdit = (id: string) => {
    setEditProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleConfirmDelete = (bizId: string) => {
    if (onDeleteBusiness) {
      onDeleteBusiness(bizId);
    }
    setDeleteConfirmId(null);
    if (editingBiz?.id === bizId) {
      setEditingBiz(null);
    }
  };

  const handleGenerateAiDescriptionForEdit = async () => {
    if (!editName) return;
    setAiEditingDesc(true);
    try {
      const res = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          city: editCity,
          keyHighlights: 'Verified authentic services and customer satisfaction',
          targetAudience: 'Pakistani clients'
        })
      });
      const data = await res.json();
      if (data.description) {
        setEditDesc(data.description);
      }
    } catch (e) {
      console.warn('AI Gen error:', e);
      setEditDesc(`${editName} is a top provider of ${editCategory} services in ${editCity}, Pakistan.`);
    } finally {
      setAiEditingDesc(false);
    }
  };

  const handleGenerateAiKeywordsForEdit = async () => {
    setAiEditingKw(true);
    try {
      const res = await fetch('/api/gemini/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          city: editCity,
          description: editDesc
        })
      });
      const data = await res.json();
      if (data.keywords && Array.isArray(data.keywords)) {
        setEditKeywords(data.keywords);
      }
    } catch (e) {
      console.warn('AI Kw error:', e);
      setEditKeywords([editCategory, `${editCategory} in ${editCity}`, editName]);
    } finally {
      setAiEditingKw(false);
    }
  };

  // If user is regular user account, display permission notice & upgrade CTA
  if (user && user.role === 'user') {
    return (
      <div className="py-16 px-4 sm:px-8 max-w-3xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase">
            User Account Restricted
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-3">Business Management Requires a Business Account</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Your account (<strong>{user.email}</strong>) is currently configured as a <strong>Regular User Account</strong>. Regular accounts can browse businesses, place orders, chat with owners, and leave reviews.
          </p>
        </div>

        <div className={`p-6 rounded-3xl border text-left space-y-3 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Business Account in 1-Click:</span>
          </h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>List and manage unlimited business profiles across Pakistan</li>
            <li>Receive customer lead inquiries directly in your inbox</li>
            <li>Use 1-Click Gemini AI to write description & generate SEO keywords</li>
            <li>Track performance analytics, profile views, and trust score</li>
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

  // 1-Click AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!formName) {
      alert('Please enter a Business Name first so AI can tailor the description!');
      return;
    }
    setAiLoadingDesc(true);
    try {
      const res = await fetch('/api/gemini/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          city: formCity,
          keyHighlights: formHighlights || 'High quality services and fast response',
          targetAudience: 'Pakistani clients and consumers'
        })
      });
      const data = await res.json();
      if (data.description) {
        setFormDesc(data.description);
      }
    } catch (err) {
      console.error(err);
      setFormDesc(`${formName} is a top-rated ${formCategory} based in ${formCity}, Pakistan offering premium quality services and fast customer support.`);
    } finally {
      setAiLoadingDesc(false);
    }
  };

  // 1-Click AI SEO Keywords Generator
  const handleGenerateAiKeywords = async () => {
    setAiLoadingKw(true);
    try {
      const res = await fetch('/api/gemini/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName || 'Business',
          category: formCategory,
          city: formCity,
          description: formDesc
        })
      });
      const data = await res.json();
      if (data.keywords && Array.isArray(data.keywords)) {
        setFormKeywords(data.keywords);
      }
    } catch (err) {
      console.error(err);
      setFormKeywords([formCategory, `${formCategory} in ${formCity}`, formName, `Best ${formCategory}`]);
    } finally {
      setAiLoadingKw(false);
    }
  };

  const handleSubmitNewBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBusiness({
      ownerId: user?.id || 'merchant-1',
      name: formName,
      category: formCategory,
      city: formCity,
      tagline: formTagline || `Leading ${formCategory} in ${formCity}`,
      description: formDesc || `${formName} provides exceptional ${formCategory} services in ${formCity}, Pakistan.`,
      phone: formPhone || '+92 300 1234567',
      whatsapp: formWhatsapp || '+923001234567',
      email: formEmail || 'contact@business.pk',
      aiKeywords: formKeywords.length > 0 ? formKeywords : [formCategory, formCity, formName]
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setFormName('');
      setFormTagline('');
      setFormDesc('');
      setFormHighlights('');
      setFormPhone('');
      setFormWhatsapp('');
      setFormEmail('');
      setFormKeywords([]);
      setAddedSuccess(false);
      setActiveTab('my-businesses');
    }, 2000);
  };

  return (
    <div className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>BizNest Merchant Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Business Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage your business listings, generate AI profiles, track lead inquiries, and review performance analytics.</p>
        </div>

        <button
          onClick={() => setActiveTab('add-business')}
          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Business Listing</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('my-businesses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'my-businesses'
              ? isDarkMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listings ({userBusinesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('add-business')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'add-business'
              ? isDarkMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Business + AI Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'analytics'
              ? isDarkMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'leads'
              ? isDarkMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-white shadow-sm'
              : isDarkMode ? 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Leads & Messages ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription Plan</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. MY BUSINESSES */}
      {activeTab === 'my-businesses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userBusinesses.map((biz) => (
              <div
                key={biz.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#0d1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={biz.logoImage}
                        alt={biz.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">{biz.name}</h3>
                        <p className="text-xs text-slate-400">{biz.category} • {biz.city}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {biz.isVerified ? 'VERIFIED ACTIVE' : 'PENDING APPROVAL'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 my-2">{biz.description}</p>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs font-bold">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Trust Score</div>
                      <div className="text-emerald-400">{biz.trustScore}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Total Views</div>
                      <div className="text-cyan-400">{biz.viewsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Inquiries</div>
                      <div className="text-purple-400">{biz.leadsCount}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Status: Published</span>
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
        </div>
      )}

      {/* 2. ADD BUSINESS WITH AI GENERATOR */}
      {activeTab === 'add-business' && (
        <div className={`p-6 sm:p-8 rounded-3xl border ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-extrabold text-white">List Your Business on BizNest</h2>
            <p className="text-xs text-slate-400 mt-0.5">Use our built-in 1-Click AI Gemini Assistant to automatically write compelling descriptions & generate top SEO search keywords.</p>
          </div>

          {addedSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <span>Business listing created and published successfully to the BizNest network!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitNewBusiness} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Botanical Nursery"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Lawyer">Lawyer</option>
                    <option value="Gym">Gym</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">City *</label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Sialkot">Sialkot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Tagline / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Exotic plants & landscaping in DHA Phase 5"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Key Highlights (For AI)</label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7 delivery, 20 years experience, organic fertilizers"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Description Section with AI Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Business Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={aiLoadingDesc}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-extrabold text-[11px] shadow-md flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-spin-slow" />
                    <span>{aiLoadingDesc ? 'Writing Description...' : '✨ Auto-Generate with Gemini AI'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe your business, services, pricing, or click the AI button above to draft one instantly!"
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Keywords Section with AI Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">SEO Search Keywords</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiKeywords}
                    disabled={aiLoadingKw}
                    className="px-3 py-1 rounded-xl bg-purple-900/40 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{aiLoadingKw ? 'Extracting Keywords...' : '✨ Generate AI SEO Tags'}</span>
                  </button>
                </div>
                
                {formKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+923001234567"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="info@business.pk"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Publish Listing to BizNest</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Impressions</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">12,840</div>
              <div className="text-[10px] text-emerald-300 mt-1">↑ +24% from last week</div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Direct Leads Generated</div>
              <div className="text-3xl font-black text-cyan-400 mt-1">642</div>
              <div className="text-[10px] text-cyan-300 mt-1">↑ +18% conversion rate</div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Avg Response Speed</div>
              <div className="text-3xl font-black text-purple-400 mt-1">&lt; 8 Mins</div>
              <div className="text-[10px] text-purple-300 mt-1">Top 5% in Lahore</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
            <h3 className="text-sm font-bold uppercase text-slate-300 tracking-wider mb-4">Customer Lead Inquiries (Past 7 Days)</h3>
            <div className="h-40 flex items-end justify-between gap-3 pt-6 border-b border-slate-800 pb-2">
              {[42, 65, 88, 54, 92, 110, 135].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    style={{ height: `${val}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-cyan-400"
                  />
                  <span className="text-[10px] text-slate-400">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LEADS INBOX */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Customer Inquiry Inbox ({leads.length})</h2>
          <div className="space-y-3">
            {leads.map((l) => (
              <div key={l.id} className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-400 text-sm">
  {l.senderName} ({l.city})
</div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    NEW LEAD
                  </span>
                </div>
                <div className="text-xs text-slate-300">{l.message}</div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Phone: {l.senderPhone}</span>
                  <span>Email: {l.senderEmail}</span>
                  <span>Date: {l.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUBSCRIPTION PLAN */}
      {activeTab === 'subscription' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1322] border border-emerald-500/40 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  100% Free Launch Access
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                  Premium Tiers Coming Soon
                </span>
              </div>
              <h2 className="text-xl font-extrabold mt-2">Merchant Launch Status</h2>
              <p className="text-xs text-slate-300 mt-0.5">All features, AI tools, and lead channels are unlocked for free during launch.</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              <span>UNLOCKED LAUNCH PLAN</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Current Billing Rate</div>
              <div className="text-2xl font-black text-emerald-400">PKR 0 <span className="text-xs text-slate-400 font-normal">/ Free Launch</span></div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Premium Plans Status</div>
              <div className="text-base font-bold text-amber-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-4 h-4" />
                <span>Coming Soon (Under Development)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
            ✨ <strong>Join early with zero risk:</strong> To support local business owners across Pakistan, BizNest provides 1-Click AI copywriter, direct customer WhatsApp inquiries, and multi-city listings at 0 PKR cost during our official launch.
          </div>
        </div>
      )}

      {/* EDIT BUSINESS MODAL */}
      <AnimatePresence>
        {editingBiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-[#0d1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">Edit Business Listing</h2>
                    <p className="text-xs text-slate-400">Update business details, contact information, products & services.</p>
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
                  <span>Changes saved successfully! Updating profile...</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-6">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300">Business Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300">Category *</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="Nursery">Nursery</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Cafe">Cafe</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Lawyer">Lawyer</option>
                      <option value="Gym">Gym</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300">City *</label>
                    <input
                      type="text"
                      required
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300">Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300">Full Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Description with Gemini AI Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-slate-300">Business Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescriptionForEdit}
                      disabled={aiEditingDesc}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-extrabold text-[11px] shadow-md flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{aiEditingDesc ? 'Rewriting...' : '✨ Rewrite with Gemini AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Contact & Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-400" />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Products & Services Management */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-400" />
                      <span>Products & Services Management</span>
                    </label>
                    <span className="text-[10px] text-slate-400">{editProducts.length} items</span>
                  </div>

                  {/* Existing list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {editProducts.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{p.name} — <span className="text-emerald-400">{p.price}</span></div>
                          <div className="text-[11px] text-slate-400">{p.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromEdit(p.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Product inline form */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Lawn Design)"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Price (e.g. PKR 5,000)"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Short description"
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddProductToEdit}
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
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
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
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
                Are you sure you want to permanently remove this business listing from BizNest? This action cannot be undone and will remove all associated inquiry logs.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirmId)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
