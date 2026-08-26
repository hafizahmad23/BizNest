import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Building2,
  Sparkles,
  ShieldCheck,
  Heart,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  RefreshCw,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { User as UserType, Order, Business } from '../types';
import { formatDbDate, mapProfileToUser, updateProfile } from '../lib/supabaseDB';
import { requestEmailChange } from '../lib/supabaseAuth';
import {
  isValidEmail,
  isValidPakistanPhone,
  isValidWhatsAppNumber,
  validateFullName,
} from '../lib/validation';

export interface ProfileDetailsPatch {
  name: string;
  phone?: string;
  whatsapp?: string;
}

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUpgradeToBusiness: () => void;
  onProfileUpdated?: (patch: ProfileDetailsPatch) => void;
  orders: Order[];
  savedBusinesses: Business[];
  onSelectBusiness?: (biz: Business) => void;
  onOpenDashboard?: () => void;
  isDarkMode?: boolean;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeToBusiness,
  onProfileUpdated,
  orders,
  savedBusinesses,
  onSelectBusiness,
  onOpenDashboard,
  isDarkMode = true,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phone?: string;
    whatsapp?: string;
  }>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailNotice, setEmailNotice] = useState('');

  // Prefill only when the modal opens for a given user — never emit to parent
  // from this effect (PR #7: no effect → parent-emit loops).
  useEffect(() => {
    if (!isOpen || !user) return;
    setFullName(user.name || '');
    setPhone(user.phone || '');
    setWhatsapp(user.whatsapp || '');
    setFieldErrors({});
    setProfileSaving(false);
    setProfileSuccess('');
    setProfileError('');
    setNewEmail('');
    setEmailSaving(false);
    setEmailError('');
    setEmailNotice('');
  }, [isOpen, user?.id]);

  if (!isOpen || !user) return null;

  const isBusinessAccount = user.role === 'business';

  const inputClass = (hasError?: boolean) =>
    `w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs focus:outline-none transition ${
      hasError
        ? 'border border-rose-400 focus:border-rose-400'
        : 'border focus:border-emerald-500'
    } ${
      isDarkMode
        ? `bg-slate-950 text-white placeholder-slate-500 ${hasError ? 'border-rose-500' : 'border-slate-800'}`
        : `bg-white text-slate-900 placeholder-slate-400 ${hasError ? 'border-rose-400' : 'border-slate-200'}`
    }`;

  const cardClass = `p-5 rounded-2xl border ${
    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
  }`;

  const resetProfileForm = () => {
    setFullName(user.name || '');
    setPhone(user.phone || '');
    setWhatsapp(user.whatsapp || '');
    setFieldErrors({});
    setProfileError('');
    setProfileSuccess('');
  };

  const validateProfileFields = () => {
    const next: { fullName?: string; phone?: string; whatsapp?: string } = {};
    const nameIssue = validateFullName(fullName);
    if (nameIssue) next.fullName = nameIssue;

    const phoneTrim = phone.trim();
    if (phoneTrim && !isValidPakistanPhone(phoneTrim)) {
      next.phone = 'Enter a valid number (e.g. 03xx-xxxxxxx or +923xxxxxxxxx).';
    }

    const waTrim = whatsapp.trim();
    if (waTrim && !isValidWhatsAppNumber(waTrim)) {
      next.whatsapp = 'Digits only, +92 prefix allowed (e.g. +923001234567).';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!validateProfileFields()) return;

    setProfileSaving(true);
    try {
      const { data, error } = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
      });

      if (error || !data) {
        setProfileError(error || 'Could not save your profile. Please try again.');
        return;
      }

      const mapped = mapProfileToUser(data, user.savedBusinessIds);
      onProfileUpdated?.({
        name: mapped.name,
        phone: mapped.phone,
        whatsapp: mapped.whatsapp,
      });
      setFullName(mapped.name);
      setPhone(mapped.phone || '');
      setWhatsapp(mapped.whatsapp || '');
      setProfileSuccess('Profile updated ✓');
    } catch {
      setProfileError('Something went wrong while saving. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSendEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailNotice('');

    const candidate = newEmail.trim().toLowerCase();
    if (!candidate || !isValidEmail(candidate)) {
      setEmailError('Please enter a valid new email address.');
      return;
    }
    if (candidate === user.email.trim().toLowerCase()) {
      setEmailError('Please enter a different email from your current one.');
      return;
    }

    setEmailSaving(true);
    try {
      const result = await requestEmailChange(candidate);
      if (!result.success) {
        setEmailError(result.error || 'Could not start the email change.');
        return;
      }
      setEmailNotice(
        result.message ||
          'Confirmation link bhej diya gaya hai — apne NAYE email ka inbox khol kar link click karein. Tab tak purana email hi login ke liye kaam karega.'
      );
      setNewEmail('');
    } catch {
      setEmailError('Something went wrong while requesting the email change.');
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl relative transition-all max-h-[90vh] flex flex-col ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-md shrink-0">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold truncate">{user.name || user.email.split('@')[0] || 'User'}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isBusinessAccount
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {isBusinessAccount ? 'Business Account' : 'User Account'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition shrink-0 ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-2 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Role</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span>Saved Favorites ({savedBusinesses.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* SECTION 1 — Profile Details */}
              <form onSubmit={handleSaveProfile} className={cardClass}>
                <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>Profile Details</span>
                </h3>
                <p className={`text-[11px] mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Update the name and numbers shown on your account. City stays as set at signup.
                </p>

                {profileSuccess && (
                  <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        name="fullName"
                        autoComplete="name"
                        required
                        minLength={3}
                        maxLength={60}
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        onBlur={() => {
                          const issue = validateFullName(fullName);
                          setFieldErrors((prev) => ({ ...prev, fullName: issue || undefined }));
                        }}
                        placeholder="e.g. Ali Hassan"
                        className={inputClass(Boolean(fieldErrors.fullName))}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-[11px] font-medium text-rose-400">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold mb-1 block">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="03xx-xxxxxxx"
                        className={inputClass(Boolean(fieldErrors.phone))}
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className="mt-1 text-[11px] font-medium text-rose-400">{fieldErrors.phone}</p>
                    ) : (
                      <p className={`mt-1 text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Optional. Format hint: 03xx-xxxxxxx
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold mb-1 block">WhatsApp Number</label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        name="whatsapp"
                        autoComplete="tel"
                        inputMode="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          setWhatsapp(e.target.value);
                          if (fieldErrors.whatsapp) {
                            setFieldErrors((prev) => ({ ...prev, whatsapp: undefined }));
                          }
                        }}
                        placeholder="+923001234567"
                        className={inputClass(Boolean(fieldErrors.whatsapp))}
                      />
                    </div>
                    {fieldErrors.whatsapp ? (
                      <p className="mt-1 text-[11px] font-medium text-rose-400">{fieldErrors.whatsapp}</p>
                    ) : (
                      <p className={`mt-1 text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Optional — jis number par customers rabta karein. Digits, +92 prefix allowed.
                      </p>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>City:</strong> {user.city || <span className="text-slate-400">Not provided</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>Member Since:</strong> {formatDbDate(user.createdAt) || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-5">
                  <button
                    type="button"
                    onClick={resetProfileForm}
                    disabled={profileSaving}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    {profileSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save profile'
                    )}
                  </button>
                </div>
              </form>

              {/* SECTION 2 — Change Email (security) */}
              <form
                onSubmit={handleSendEmailChange}
                className={`p-5 rounded-2xl border relative overflow-hidden ${
                  isDarkMode
                    ? 'bg-slate-950/80 border-amber-500/25'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Change Email</span>
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Security setting. A confirmation link is sent to the new address. Your current
                      email stays active for login until you click that link.
                    </p>
                  </div>
                </div>

                {emailNotice && (
                  <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-medium leading-relaxed">
                    {emailNotice}
                  </div>
                )}

                {emailError && (
                  <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold mb-1 block">Current email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        readOnly
                        value={user.email}
                        className={`${inputClass(false)} opacity-80 cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold mb-1 block">New email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        name="newEmail"
                        autoComplete="email"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="new.address@example.com"
                        className={inputClass(Boolean(emailError) && !emailNotice)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={emailSaving}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow transition ${
                      isDarkMode
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    } disabled:opacity-60`}
                  >
                    {emailSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Send confirmation link
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Role & Account Upgrade Banner */}
              {!isBusinessAccount ? (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-purple-500/10 border border-emerald-500/30 relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade to Business Account</span>
                    </div>

                    <h4 className="text-lg font-extrabold">Are you a merchant or business owner?</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed max-w-xl">
                      Upgrade your account to a <strong>Business Account</strong> for free. Unlock your dedicated Merchant Control Center, list unlimited business profiles, respond to customer inquiries, and manage products on BizNest.
                    </p>

                    <button
                      type="button"
                      onClick={onUpgradeToBusiness}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Convert to Business Account Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                      <CheckCircle className="w-5 h-5" />
                      <span>Business Account Active</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      You have full access to add, edit, and manage business listings on Pakistan’s largest directory.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenDashboard) onOpenDashboard();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-2 cursor-pointer shadow"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Open Business Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm font-semibold">No orders placed yet.</p>
                  <p className="text-xs text-slate-500">Explore businesses and add products to your cart to check out!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-5 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <div className="text-[10px] text-slate-400">{order.createdAt}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {order.paymentMethod.toUpperCase()} • {order.orderStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-200 font-medium">{item.productName} × {item.quantity}</span>
                          <span className="font-bold">{item.formattedPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
                      <span className="text-slate-500">Total Paid:</span>
                      <span className="text-emerald-500 font-extrabold text-sm">PKR {order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {savedBusinesses.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Heart className="w-10 h-10 mx-auto opacity-40 text-red-500" />
                  <p className="text-sm font-semibold">No saved favorites yet.</p>
                  <p className="text-xs text-slate-500">Click the heart icon on any business listing to bookmark it here!</p>
                </div>
              ) : (
                savedBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    onClick={() => {
                      if (onSelectBusiness) onSelectBusiness(biz);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:scale-[1.01] ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {biz.logoImage ? (
                        <img src={biz.logoImage} alt={biz.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 flex items-center justify-center">
                          <span className="text-lg font-extrabold text-emerald-400">{biz.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs">{biz.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{biz.category} • {biz.city}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">View Listing →</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
