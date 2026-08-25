import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Search, PlusCircle, LayoutDashboard, ShieldAlert, Moon, Sun, Menu, X, MapPin, 
  Sparkles, User as UserIcon, ShoppingBag, LogOut, Settings, Bell, CheckCheck, MessageSquare, 
  ShieldCheck, PhoneCall, Trash2, CheckCircle2, Clock
} from 'lucide-react';
import { PAKISTAN_CITIES } from '../data/mockData';
import { User, AppNotification } from '../types';

interface NavbarProps {
  currentCity?: string;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  onNavigate?: (view: 'home' | 'businesses' | 'categories' | 'cities' | 'pricing' | 'contact' | 'dashboard' | 'admin') => void;
  onOpenAiMatchmaker?: () => void;
  activeView?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleDarkMode?: () => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onOpenCart?: () => void;
  cartItemCount?: number;
  onLogout?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearNotifications?: () => void;
  [key: string]: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  selectedCity,
  onCityChange = (_city?: string) => {},
  onNavigate = (_view?: any) => {},
  onOpenAiMatchmaker = () => {},
  activeView = 'home',
  isDarkMode = true,
  onToggleTheme,
  onToggleDarkMode,
  currentUser = null,
  onOpenAuth = () => {},
  onOpenSettings = () => {},
  onOpenCart = () => {},
  cartItemCount = 0,
  onLogout = () => {},
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearNotifications
}) => {
  const effectiveCity = currentCity || selectedCity || 'all';
  const handleToggleTheme = onToggleTheme || onToggleDarkMode || (() => {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-4 py-3 transition-all duration-300">
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#020617]/85 border border-slate-800/80 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl text-white' 
          : 'bg-white/90 border border-slate-200/90 shadow-lg shadow-slate-200/50 backdrop-blur-xl text-slate-900'
      } px-3 sm:px-4 py-3 flex items-center justify-between relative z-10`}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isDarkMode ? 'bg-[#020617]' : 'bg-white'
            }`}>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                BizNest
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PK
              </span>
            </div>
            <p className={`text-[10px] font-medium leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Business Ecosystem
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 font-medium text-sm">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'home'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('businesses')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'businesses'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Businesses
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'categories'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('cities')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'cities'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Cities
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'pricing'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className={`px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${
              activeView === 'contact'
                ? isDarkMode
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Contact
          </button>

          {/* Admin link — visible ONLY to real admins (profiles.role === 'admin') */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold border ${
                activeView === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'text-slate-400 hover:text-purple-300 border-transparent hover:bg-purple-500/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiMatchmaker}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ml-1 border shadow-sm ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/20 hover:from-purple-600/30 hover:to-cyan-500/30 border-purple-500/30 text-purple-300'
                : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span>AI Matchmaker</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-2 min-w-0">
          {/* City Quick Selector */}
          <div className="relative hidden xl:flex items-center shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3 pointer-events-none" />
            <select
              value={effectiveCity}
              onChange={(e) => onCityChange(e.target.value)}
              className={`pl-8 pr-6 py-1.5 rounded-xl text-xs font-semibold appearance-none cursor-pointer focus:outline-none transition ${
                isDarkMode 
                  ? 'bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:border-emerald-500/50' 
                  : 'bg-slate-100 border border-slate-200 text-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <option value="all">All Pakistan</option>
              {PAKISTAN_CITIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cart Icon Button */}
          <button
            onClick={onOpenCart}
            title="View Shopping Cart"
            className={`p-2 rounded-xl transition relative ${
              isDarkMode ? 'bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white' : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
              className={`p-2 rounded-xl transition relative cursor-pointer ${
                notifOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isDarkMode
                    ? 'bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                {/* Header */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-extrabold text-[10px] border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    {notifications.length > 0 && onClearNotifications && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                      <Bell className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                      <p className="font-semibold text-slate-300">No Notifications</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        You'll receive alerts here when customer inquiries receive replies or business status changes.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                          className={`p-3.5 transition cursor-pointer flex items-start gap-3 relative ${
                            isUnread
                              ? isDarkMode
                                ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                                : 'bg-emerald-50/50 hover:bg-emerald-50'
                              : isDarkMode
                                ? 'hover:bg-slate-900/60'
                                : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Left Icon Based on Type */}
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
                            notif.type === 'inquiry_reply'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : notif.type === 'business_status'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : notif.type === 'lead'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {notif.type === 'inquiry_reply' && <MessageSquare className="w-4 h-4" />}
                            {notif.type === 'business_status' && <ShieldCheck className="w-4 h-4" />}
                            {notif.type === 'lead' && <PhoneCall className="w-4 h-4" />}
                            {notif.type === 'order' && <ShoppingBag className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h4 className={`text-xs font-bold truncate ${
                                isUnread ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                              }`}>
                                {notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {notif.timestamp}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>

                          {/* Unread green dot */}
                          {isUnread && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer status link */}
                <div className="p-2.5 bg-slate-100/80 dark:bg-slate-950 text-[10px] text-center text-slate-400 border-t border-slate-200 dark:border-slate-800">
                  BizNest Real-Time Merchant & Customer Alerts
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSettings}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate">{currentUser.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : currentUser.role === 'business'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'business' ? 'Biz' : 'User'}
                </span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                title="Business Dashboard"
                className={`p-2 rounded-xl transition ${
                  activeView === 'dashboard'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isDarkMode ? 'bg-slate-900/80 border border-slate-800 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Logout"
                className={`p-2 rounded-xl transition hover:text-red-400 ${
                  isDarkMode ? 'bg-slate-900/80 border border-slate-800 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-500'
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Dark / Light Toggle with Smooth Morphing Animation */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleToggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-300 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900/90 border border-slate-700/80 text-amber-400 hover:border-amber-400/50 hover:bg-slate-800' 
                : 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100/80 shadow-slate-200/50'
            }`}
            title={`Switch to ${isDarkMode ? 'Light Premium' : 'Dark Luxury'} Theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <motion.div
                  key="sun-icon"
                  initial={{ rotate: -90, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon-icon"
                  initial={{ rotate: 90, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Primary CTA: Add Business */}
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
              } else if (currentUser.role === 'business' || currentUser.role === 'admin') {
                onNavigate('dashboard');
              } else {
                onOpenSettings();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-md transition transform hover:-translate-y-0.5 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Business</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg bg-slate-800 text-white relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="p-2 rounded-lg bg-slate-800 text-white relative"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onToggleTheme}
            className={`p-2 rounded-lg text-xs relative overflow-hidden flex items-center justify-center cursor-pointer ${
              isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-amber-600 border border-slate-200'
            }`}
            title="Toggle Light/Dark Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <motion.div
                  key="mob-sun"
                  initial={{ rotate: -90, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="mob-moon"
                  initial={{ rotate: 90, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden mt-2 p-4 rounded-2xl border shadow-xl ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        } flex flex-col gap-3 font-medium text-sm`}>
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('businesses'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40"
          >
            Explore Businesses
          </button>
          <button
            onClick={() => { onNavigate('categories'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40"
          >
            Categories
          </button>
          <button
            onClick={() => { onNavigate('cities'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40"
          >
            Cities
          </button>
          <button
            onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40"
          >
            Pricing (Free Launch)
          </button>
          <button
            onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg hover:bg-slate-800/40 text-emerald-400 font-bold"
          >
            Contact Support Desk
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg hover:bg-purple-500/10 text-purple-400 font-bold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          {currentUser ? (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{currentUser.name}</span>
                <span className="text-emerald-400 uppercase text-[10px]">{currentUser.role}</span>
              </div>
              <button
                onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
                className="w-full py-1.5 text-center text-xs text-slate-300 bg-slate-800 rounded-lg"
              >
                Account Settings
              </button>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-1.5 text-center text-xs text-red-400 bg-red-500/10 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Sign In / Register
            </button>
          )}

          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your Business</span>
          </button>
        </div>
      )}
    </header>
  );
};