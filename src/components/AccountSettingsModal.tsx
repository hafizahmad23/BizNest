import React, { useState } from 'react';
import { X, User, Building2, Sparkles, ShieldCheck, Heart, ShoppingBag, ArrowRight, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { User as UserType, Order, Business } from '../types';
import { formatDbDate } from '../lib/supabaseDB';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUpgradeToBusiness: () => void;
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
  orders,
  savedBusinesses,
  onSelectBusiness,
  onOpenDashboard,
  isDarkMode = true
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');

  if (!isOpen || !user) return null;

  const isBusinessAccount = user.role === 'business';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl relative transition-all max-h-[90vh] flex flex-col ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-xl text-slate-950 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{user.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isBusinessAccount 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {isBusinessAccount ? 'Business Account' : 'User Account'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Role</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
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
              {/* Account Overview Card */}
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Account Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span><strong>Email:</strong> {user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span><strong>Phone:</strong> {user.phone || <span className="text-slate-400">Not provided</span>}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span><strong>City:</strong> {user.city || <span className="text-slate-400">Not provided</span>}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <User className="w-4 h-4 text-slate-400" />
                    <span><strong>Member Since:</strong> {formatDbDate(user.createdAt) || '—'}</span>
                  </div>
                </div>
              </div>

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
