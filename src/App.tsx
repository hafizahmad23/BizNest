import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Loader } from './components/Loader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveStats } from './components/LiveStats';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedBusinesses } from './components/FeaturedBusinesses';
import { PakistanMap } from './components/PakistanMap';
import { BusinessProfilePage } from './components/BusinessProfilePage';
import { CompareModal } from './components/CompareModal';
import { AiMatchmakerModal } from './components/AiMatchmakerModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PricingSection } from './components/PricingSection';
import { ContactSection } from './components/ContactSection';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ChatModal } from './components/ChatModal';
import { FloatingChatInbox } from './components/FloatingChatInbox';
import { SEOHead } from './components/SEOHead';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import ResetPassword from './components/ResetPassword';

import {
  getCurrentSupabaseUser,
  logoutFromSupabase,
  subscribeToSupabaseAuthChanges,
} from './lib/supabaseAuth';

import {
  fetchBusinesses,
  fetchBusinessById,
  fetchBusinessesByOwner,
  createBusiness,
  updateBusiness,
  updateBusinessAiContent,
  deleteBusiness,
  incrementBusinessViews,
  createReview,
  createLead,
  fetchLeadsByBusiness,
  fetchSavedBusinesses,
  saveBusiness,
  unsaveBusiness,
  addToCart as dbAddToCart,
  updateCartQuantity as dbUpdateCartQuantity,
  removeFromCart as dbRemoveFromCart,
  clearCart as dbClearCart,
  fetchCartItems,
  computeCartTotals,
  createOrder,
  fetchMyOrders,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
  upgradeToBusinessRole,
  fetchPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  fetchAdminStats,
} from './lib/supabaseDB';
import type { CreateBusinessInput } from './lib/supabaseDB';

import { locationService } from './data/locationService';

import {
  Business,
  FilterState,
  LeadInquiry,
  User,
  CartItem,
  Order,
  AppNotification,
  AdminStats,
  ChatConversation,
} from './types';

type AppView =
  | 'home'
  | 'businesses'
  | 'categories'
  | 'cities'
  | 'pricing'
  | 'dashboard'
  | 'admin'
  | 'contact'
  | 'business-profile';

const GUEST_CART_KEY = 'biznest_guest_cart_v1';

// Theme persistence: light is the site default; the user's explicit choice
// (light/dark) survives reloads via localStorage.
const THEME_KEY = 'biznest_theme_v1';

function loadInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark'; // light (false) for fresh visitors
  } catch {
    return false; // storage unavailable → light default
  }
}

function persistTheme(isDark: boolean) {
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch {
    /* storage unavailable — choice just won't persist */
  }
}

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
}

export default function App() {
  // --------------------------------------------------
  // CORE UI STATE
  // --------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(loadInitialTheme);
  const [currentView, setCurrentView] = useState<AppView>('home');

  // --------------------------------------------------
  // DATA (all live from Supabase — no mock fallbacks)
  // --------------------------------------------------
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [businessesError, setBusinessesError] = useState<string | null>(null);

  const [myBusinesses, setMyBusinesses] = useState<Business[]>([]);
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedBusinessesList, setSavedBusinessesList] = useState<Business[]>([]);

  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // --------------------------------------------------
  // AUTH (role comes from the profiles table — authoritative)
  // --------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ==================================================
  // AUTH GATE ONE-WAY LATCH
  // Once the main app has rendered for a signed-in user it must NEVER be
  // unmounted again for the lifetime of the page — no transient auth event
  // (TOKEN_REFRESHED, INITIAL_SESSION, a momentary getSession/getUser
  // failure or null session mid-refresh) may kick the user back to the
  // loader/welcome screen. Only an explicit SIGNED_OUT resets the latch.
  // ==================================================
  const mainAppShownRef = useRef(false);

  // Guards against duplicate full user-data loads for the same user within
  // one page lifetime (login handler + SIGNED_IN listener both fire).
  const scopedDataLoadedForRef = useRef<string | null>(null);

  // --------------------------------------------------
  // MODALS & SELECTION
  // --------------------------------------------------
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatBusiness, setChatBusiness] = useState<Business | null>(null);
  const [chatConversation, setChatConversation] = useState<ChatConversation | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  // Where the storefront profile page's Back button returns to.
  const profileReturnViewRef = useRef<AppView>('home');
  // Scroll position to restore when the profile page closes.
  const profileScrollYRef = useRef(0);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);

  // --------------------------------------------------
  // CART
  // --------------------------------------------------
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    city: 'all',
    verifiedOnly: false,
    minRating: 0,
    sortBy: 'newest',
  });

  // ==================================================
  // DATA LOADERS
  // ==================================================

  const loadBusinesses = useCallback(async () => {
    setBusinessesLoading(true);
    setBusinessesError(null);
    const { data, error } = await fetchBusinesses({ sortBy: 'newest', pageSize: 100 });
    if (error) {
      setBusinessesError(error);
      setBusinesses([]);
    } else {
      setBusinesses(data || []);
    }
    setBusinessesLoading(false);
  }, []);

  const loadLeadsForOwner = useCallback(async (owned: Business[]) => {
    if (owned.length === 0) {
      setLeads([]);
      return;
    }
    const results = await Promise.all(owned.map((b) => fetchLeadsByBusiness(b.id)));
    const merged = results.flatMap((r) => r.data || []);
    merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    setLeads(merged);
  }, []);

  const loadUserScopedData = useCallback(
    async (user: User) => {
      // Skip duplicate full loads for the same user in one page lifetime.
      if (scopedDataLoadedForRef.current === user.id) return;
      scopedDataLoadedForRef.current = user.id;

      // Owned businesses + their leads (business-role users)
      const ownedRes = await fetchBusinessesByOwner(user.id);
      const owned = ownedRes.data || [];
      setMyBusinesses(owned);
      await loadLeadsForOwner(owned);

      // Notifications + realtime push
      const notifRes = await fetchNotifications();
      setNotifications(notifRes.data || []);

      // Orders
      const ordersRes = await fetchMyOrders();
      setOrders(ordersRes.data || []);

      // Saved businesses
      const savedRes = await fetchSavedBusinesses(user.id);
      const saved = savedRes.data || [];
      setSavedBusinessesList(saved);
      // Merge saved ids WITHOUT changing the user object's identity when
      // nothing actually changed — a new identity here re-runs the realtime
      // notification subscription effect (and every [currentUser] consumer)
      // on each load.
      setCurrentUser((prev) => {
        if (!prev || prev.id !== user.id) return prev;
        const nextIds = saved.map((b) => b.id).sort().join('|');
        const prevIds = [...prev.savedBusinessIds].sort().join('|');
        if (prevIds === nextIds) return prev; // identity-stable no-op
        return { ...prev, savedBusinessIds: saved.map((b) => b.id) };
      });

      // Merge any guest cart into the persistent DB cart
      const guest = loadGuestCart();
      if (guest.length > 0) {
        for (const item of guest) {
          await dbAddToCart(item.productId, item.quantity);
        }
        persistGuestCart([]);
      }
      const cartRes = await fetchCartItems();
      setCartItems(cartRes.data || []);

      // Admin data
      if (user.role === 'admin') {
        const [pendingRes, statsRes] = await Promise.all([
          fetchPendingBusinesses(),
          fetchAdminStats(),
        ]);
        setPendingBusinesses(pendingRes.data || []);
        setAdminStats(statsRes.data || null);
      }
    },
    [loadLeadsForOwner]
  );

  const clearUserScopedData = useCallback(() => {
    setMyBusinesses([]);
    setLeads([]);
    setNotifications([]);
    setOrders([]);
    setSavedBusinessesList([]);
    setPendingBusinesses([]);
    setAdminStats(null);
    setCartItems(loadGuestCart());
    scopedDataLoadedForRef.current = null;
  }, []);

  // ==================================================
  // APP INIT: auth session restore + listener
  // ==================================================
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const user = await getCurrentSupabaseUser();
        if (!active) return;
        setCurrentUser(user);
        if (user) {
          void loadUserScopedData(user);
        }
      } catch (error) {
        console.error('Failed to restore Supabase session:', error);
        if (active) setCurrentUser(null);
      } finally {
        if (active) {
          // The gate flips ONLY here — after the session (and the user, if
          // any) has been fully restored. Never from the auth listener.
          setAuthChecked(true);
          setLoading(false);
        }
      }
    };

    void restoreSession();

    const unsubscribe = subscribeToSupabaseAuthChanges((user, event) => {
      if (!active) return;

      // The ONLY path back to the loader/welcome screen is an explicit
      // SIGNED_OUT. Every other event keeps the mounted app mounted (the
      // mainAppShownRef latch) — transient session gaps, token refreshes and
      // INITIAL_SESSION repeats must never unmount the app mid-use.
      if (event === 'SIGNED_OUT') {
        mainAppShownRef.current = false;
        setCurrentUser(null);
        clearUserScopedData();
        setCurrentView('home');
        return;
      }

      if (event === 'SIGNED_IN' && user) {
        // Identity-stable: setting a new object for the same user id would
        // re-run every [currentUser] effect for no reason.
        setCurrentUser((prev) => (prev && prev.id === user.id ? prev : user));
        void loadUserScopedData(user);
      }
      // INITIAL_SESSION / TOKEN_REFRESHED / USER_UPDATED / transient null
      // sessions: intentionally ignored — session restore owns first load,
      // and the gate is a one-way latch afterwards.
    });

    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The intro loader must never finish before the Supabase session restore
  // completes — otherwise the Welcome screen flashes for a logged-in user
  // (whose restore is slower than the loader timer) and the app remounts.
  useEffect(() => {
    if (authChecked) setLoading(false);
  }, [authChecked]);

  // ==================================================
  // INITIAL PUBLIC DATA (businesses — real DB only)
  // ==================================================
  useEffect(() => {
    void loadBusinesses();
    setCartItems(loadGuestCart());
  }, [loadBusinesses]);

  // ==================================================
  // DEEP LINKS (?business=, ?city=, ?category=, ?search=)
  // ?business=<id> opens the storefront profile page directly.
  // ==================================================
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const params = new URLSearchParams(window.location.search);
    const businessId = params.get('business');
    let filtersApplied = false;

    const city = params.get('city');
    const category = params.get('category');
    const search = params.get('search');
    if (city !== null || category !== null || search !== null) {
      filtersApplied = true;
      setFilterState((prev) => ({
        ...prev,
        city: city !== null ? city || 'all' : prev.city,
        category: category !== null ? category || 'all' : prev.category,
        searchQuery: search !== null ? search || '' : prev.searchQuery,
      }));
      setCurrentView('businesses');
    }

    if (businessId) {
      void (async () => {
        const { data } = await fetchBusinessById(businessId);
        if (data) {
          // Deep link lands directly on the storefront page. Back returns to
          // the filtered list when city/category/search were also given,
          // otherwise to home.
          profileReturnViewRef.current = filtersApplied ? 'businesses' : 'home';
          setSelectedBusiness(data);
          setCurrentView('business-profile');
          try {
            window.history.replaceState(
              { biznestBusiness: data.id },
              '',
              window.location.href
            );
          } catch {
            /* history API unavailable — back button falls back to view restore */
          }
        }
      })();
    }
  }, []);

  // ==================================================
  // REALTIME NOTIFICATIONS
  // Keyed by the user ID (not the whole user object) so the subscription is
  // not torn down and recreated whenever currentUser's identity changes.
  // ==================================================
  const currentUserId = currentUser?.id;
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeToNotifications(currentUserId, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return unsubscribe;
  }, [currentUserId]);

  // ==================================================
  // NAVIGATION / THEME
  // ==================================================

  const handleFinishLoader = () => setLoading(false);
  const handleToggleTheme = () =>
    setIsDarkMode((p) => {
      const next = !p;
      persistTheme(next);
      return next;
    });

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToListings = () => {
    const element = document.getElementById('featured-businesses');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCity = (city: string) => {
    setFilterState((p) => ({ ...p, city }));
    setCurrentView('businesses');
    scrollToListings();
  };

  const handleSelectCategory = (category: string) => {
    setFilterState((p) => ({ ...p, category }));
    setCurrentView('businesses');
    scrollToListings();
  };

  const handleSearchSubmit = (
    query: string,
    category: string,
    city: string,
    verifiedOnly: boolean = false
  ) => {
    setFilterState((p) => ({
      ...p,
      searchQuery: query,
      category: category || 'all',
      city: city || 'all',
      verifiedOnly,
    }));
    setCurrentView('businesses');
    scrollToListings();
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState((p) => ({ ...p, ...newFilters }));
  };

  // ==================================================
  // AUTH FLOWS
  // ==================================================

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    void loadUserScopedData(user);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    await logoutFromSupabase();
    // Explicit sign-out is the one allowed way back to the welcome screen.
    mainAppShownRef.current = false;
    setCurrentUser(null);
    clearUserScopedData();
    setCurrentView('home');
  };

  /**
   * TASK 5 FIX: role upgrade is an awaited profiles-table write.
   * Local state only changes AFTER the DB confirms — role survives refresh.
   */
  const handleUpgradeToBusiness = async () => {
    if (!currentUser) return;

    // Admins never "upgrade" — skip before the profiles write so an admin
    // can never be demoted to 'business' by the upgrade flow.
    if (currentUser.role === 'admin') {
      setCurrentView('dashboard');
      setIsSettingsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const { data, error } = await upgradeToBusinessRole();

    if (error || !data) {
      alert(error || 'Business account upgrade could not be saved. Please try again.');
      return;
    }

    // DB confirmed — now update React state from the DB row.
    setCurrentUser({ ...currentUser, role: data.role as User['role'] });
    setCurrentView('dashboard');
    setIsSettingsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==================================================
  // COMPARE
  // ==================================================

  const handleToggleCompare = (business: Business) => {
    setComparedIds((previous) => {
      if (previous.includes(business.id)) {
        return previous.filter((id) => id !== business.id);
      }
      if (previous.length >= 3) {
        alert('You can compare a maximum of 3 businesses simultaneously.');
        return previous;
      }
      return [...previous, business.id];
    });
  };

  // ==================================================
  // BUSINESS STOREFRONT PAGE (full-page successor of the old modal)
  //  - Opens as the dedicated 'business-profile' view from EVERY entry
  //    point (cards, search, saved list, matchmaker, dashboard previews).
  //  - A history entry is pushed so the browser Back button closes the
  //    page and restores the previous view.
  //  - Fresh fetch incl. reviews + view-count increment (as before).
  // ==================================================

  const handleOpenBusiness = async (business: Business) => {
    if (currentView !== 'business-profile') {
      profileReturnViewRef.current = currentView;
      // Remember scroll so Back returns to the same spot in the list.
      profileScrollYRef.current = window.scrollY;
    }
    setSelectedBusiness(business);
    setCurrentView('business-profile');
    window.scrollTo({ top: 0 });
    void incrementBusinessViews(business.id);

    // Push a history entry carrying the marker so browser Back closes the
    // profile (the popstate effect below performs the actual close).
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('business', business.id);
      window.history.pushState({ biznestBusiness: business.id }, '', `/?${params.toString()}`);
    } catch {
      /* history API unavailable — in-page Back still works */
    }

    const { data } = await fetchBusinessById(business.id);
    if (data) {
      // Only enrich if the same business page is still open (the user may
      // have pressed Back before this resolves).
      setSelectedBusiness((prev) => (prev && prev.id === data.id ? data : prev));
      setBusinesses((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
    }
  };

  /** Close the profile page and return to the previous view. */
  const closeBusinessProfile = useCallback(() => {
    setSelectedBusiness(null);
    setCurrentView((prev) => (prev === 'business-profile' ? profileReturnViewRef.current : prev));
    // Restore the list scroll position after the returning view paints.
    const y = profileScrollYRef.current;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => window.scrollTo({ top: y }))
    );
    // Drop ?business= from the address bar so a reload after closing does
    // not re-open the profile page.
    try {
      if (window.location.pathname === '/') {
        const params = new URLSearchParams(window.location.search);
        if (params.has('business')) {
          params.delete('business');
          const qs = params.toString();
          window.history.replaceState(
            window.history.state,
            '',
            qs ? `/?${qs}` : '/'
          );
        }
      }
    } catch {
      /* history API unavailable */
    }
  }, []);

  /** In-page Back button: prefer history.back() (pops our pushed entry).
   *  When there is nothing to pop (fresh deep link in a new tab),
   *  history.back() is a no-op — the fallback timer closes the page
   *  directly so the button always works. */
  const handleProfileBack = useCallback(() => {
    const state = window.history.state as { biznestBusiness?: string } | null;
    if (state && state.biznestBusiness) {
      let closed = false;
      const onClose = () => {
        closed = true;
      };
      window.addEventListener('popstate', onClose, { once: true });
      window.history.back();
      window.setTimeout(() => {
        window.removeEventListener('popstate', onClose);
        if (!closed) closeBusinessProfile();
      }, 350);
    } else {
      closeBusinessProfile();
    }
  }, [closeBusinessProfile]);

  // Browser Back / popstate closes the storefront profile page.
  useEffect(() => {
    if (currentView !== 'business-profile') return;
    const onPopState = () => closeBusinessProfile();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentView, closeBusinessProfile]);

  // ==================================================
  // SAVED BUSINESSES (persisted in Supabase)
  // ==================================================

  const handleToggleSaveBusiness = async (business: Business) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const isSaved = currentUser.savedBusinessIds.includes(business.id);
    const result = isSaved
      ? await unsaveBusiness(business.id)
      : await saveBusiness(business.id);

    if (result.error) {
      alert(result.error);
      return;
    }

    const updatedIds = isSaved
      ? currentUser.savedBusinessIds.filter((id) => id !== business.id)
      : [...currentUser.savedBusinessIds, business.id];

    setCurrentUser({ ...currentUser, savedBusinessIds: updatedIds });
    const savedRes = await fetchSavedBusinesses(currentUser.id);
    setSavedBusinessesList(savedRes.data || []);
  };

  // ==================================================
  // CART (persistent in Supabase for users, localStorage for guests)
  // ==================================================

  const updateGuestCart = (updater: (prev: CartItem[]) => CartItem[]) => {
    setCartItems((prev) => {
      const next = updater(prev);
      persistGuestCart(next);
      return next;
    });
  };

  const handleAddToCart = async (item: CartItem) => {
    if (currentUser) {
      const { data, error } = await dbAddToCart(item.productId, item.quantity);
      if (error) {
        alert(error);
        return;
      }
      setCartItems(data || []);
    } else {
      updateGuestCart((prev) => {
        const existing = prev.find((ci) => ci.productId === item.productId);
        if (existing) {
          return prev.map((ci) =>
            ci.productId === item.productId ? { ...ci, quantity: ci.quantity + 1 } : ci
          );
        }
        return [...prev, item];
      });
    }
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = async (id: string, delta: number) => {
    if (currentUser) {
      const item = cartItems.find((ci) => ci.id === id);
      if (!item) return;
      const { data, error } = await dbUpdateCartQuantity(id, item.quantity + delta);
      if (error) {
        alert(error);
        return;
      }
      setCartItems(data || []);
    } else {
      updateGuestCart((prev) =>
        prev
          .map((ci) =>
            ci.id === id ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci
          )
          .filter((ci) => ci.quantity > 0)
      );
    }
  };

  const handleRemoveCartItem = async (id: string) => {
    if (currentUser) {
      const { data, error } = await dbRemoveFromCart(id);
      if (error) {
        alert(error);
        return;
      }
      setCartItems(data || []);
    } else {
      updateGuestCart((prev) => prev.filter((ci) => ci.id !== id));
    }
  };

  const handleClearCart = async () => {
    if (currentUser) {
      const { error } = await dbClearCart();
      if (error) {
        alert(error);
        return;
      }
    } else {
      persistGuestCart([]);
    }
    setCartItems([]);
  };

  // ==================================================
  // ORDERS (persisted in Supabase — one order per business)
  // ==================================================

  const handlePlaceOrder = async (draft: {
    paymentMethod: Order['paymentMethod'];
    address: string;
    city: string;
    transactionRef?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Please log in to place an order.' };
    }
    if (cartItems.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // Group cart items by business (orders table is per-business)
    const byBusiness = new Map<string, CartItem[]>();
    cartItems.forEach((item) => {
      const list = byBusiness.get(item.businessId) || [];
      list.push(item);
      byBusiness.set(item.businessId, list);
    });

    for (const [businessId, items] of byBusiness) {
      const { subtotal, deliveryFee, grandTotal } = computeCartTotals(items);

      const { error } = await createOrder({
        businessId,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        deliveryFee,
        total: grandTotal,
        paymentMethod: draft.paymentMethod,
        deliveryAddress: `${draft.address}, ${draft.city}`,
        transactionReference: draft.transactionRef,
      });

      if (error) {
        return { success: false, error };
      }
    }

    await handleClearCart();
    const ordersRes = await fetchMyOrders();
    setOrders(ordersRes.data || []);

    return { success: true };
  };

  // ==================================================
  // BUSINESS CRUD (Supabase-backed)
  // ==================================================

  const handleAddBusiness = async (
    input: CreateBusinessInput
  ): Promise<{ success: boolean; error?: string }> => {
    const { data: created, error } = await createBusiness(input);
    if (error || !created) {
      return { success: false, error: error || 'Could not create the listing.' };
    }

    setMyBusinesses((prev) => [created, ...prev]);

    // Unique per-business AI content (tagline/description/keywords) — runs
    // after the DB insert and persists back into the businesses row.
    void generateAiContentForBusiness(created, input);

    return { success: true };
  };

  const generateAiContentForBusiness = async (
    business: Business,
    input: CreateBusinessInput
  ) => {
    try {
      const payload = {
        name: input.name,
        category: business.category || input.name,
        city: business.city || '',
        description: input.description,
        keyHighlights: input.description?.slice(0, 180),
        targetAudience: 'Pakistani consumers and businesses',
      };

      const [taglineRes, keywordsRes] = await Promise.all([
        fetch('/api/gemini/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, mode: 'tagline' }),
        }).then((r) => r.json()),
        fetch('/api/gemini/generate-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then((r) => r.json()),
      ]);

      const aiUpdate: { tagline?: string; keywords?: string[] } = {};
      if (taglineRes?.description && typeof taglineRes.description === 'string') {
        aiUpdate.tagline = taglineRes.description.trim().split('\n')[0].slice(0, 160);
      }
      if (Array.isArray(keywordsRes?.keywords) && keywordsRes.keywords.length > 0) {
        aiUpdate.keywords = keywordsRes.keywords;
      }

      if (aiUpdate.tagline || aiUpdate.keywords) {
        const { data: updated } = await updateBusinessAiContent(business.id, aiUpdate);
        if (updated) {
          setMyBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        }
      }
    } catch (e) {
      console.warn('AI content generation skipped:', e);
    }
  };

  const handleUpdateBusiness = async (
    id: string,
    patch: Partial<CreateBusinessInput>
  ): Promise<{ success: boolean; error?: string }> => {
    const { data: updated, error } = await updateBusiness(id, patch);
    if (error || !updated) {
      return { success: false, error: error || 'Could not save changes.' };
    }

    setMyBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    return { success: true };
  };

  const handleDeleteBusiness = async (businessId: string): Promise<void> => {
    const { error } = await deleteBusiness(businessId);
    if (error) {
      alert(error);
      return;
    }
    setMyBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
  };

  /**
   * Re-fetch the signed-in user's owned businesses (incl. fresh product
   * lists) and merge them into the public list. Used by the dashboard's
   * dedicated product management flow so saves show up everywhere at once.
   */
  const refreshMyBusinesses = useCallback(async () => {
    const userId = currentUser?.id;
    if (!userId) return;
    const ownedRes = await fetchBusinessesByOwner(userId);
    const owned = ownedRes.data;
    if (owned) {
      setMyBusinesses(owned);
      setBusinesses((prev) => {
        const map = new Map(prev.map((b) => [b.id, b]));
        owned.forEach((b) => map.set(b.id, b));
        return Array.from(map.values());
      });
      setSelectedBusiness((prev) => {
        if (!prev) return prev;
        const fresh = owned.find((b) => b.id === prev.id);
        return fresh ? { ...fresh, reviews: prev.reviews } : prev;
      });
    }
  }, [currentUser?.id]);

  // ==================================================
  // ADMIN ACTIONS (RLS + is_admin() verified server-side)
  // ==================================================

  const handleApproveBusiness = async (id: string) => {
    const { error } = await approveBusiness(id);
    if (error) {
      alert(error);
      return;
    }
    const approved = pendingBusinesses.find((b) => b.id === id);
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    if (approved) {
      setBusinesses((prev) => [{ ...approved, status: 'active' }, ...prev]);
    }
    const statsRes = await fetchAdminStats();
    setAdminStats(statsRes.data || null);
  };

  const handleRejectBusiness = async (id: string, reason?: string) => {
    const { error } = await rejectBusiness(id, reason);
    if (error) {
      alert(error);
      return;
    }
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== id));
    const statsRes = await fetchAdminStats();
    setAdminStats(statsRes.data || null);
  };

  // ==================================================
  // LEADS (persisted in Supabase)
  // ==================================================

  const handleSubmitLead = async (
    businessId: string,
    name: string,
    phone: string,
    email: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await createLead({
      businessId,
      senderName: name,
      senderPhone: phone,
      senderEmail: email,
      message,
    });

    if (error) return { success: false, error };

    return { success: true };
  };

  // ==================================================
  // REVIEWS (persisted in Supabase, rating recalculated by DB trigger)
  // ==================================================

  const handleSubmitReview = async (
    businessId: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Please log in to write a review.' };
    }

    const { error } = await createReview(businessId, rating, comment);
    if (error) return { success: false, error };

    // Refetch business so rating/review_count from the DB trigger show up.
    const { data } = await fetchBusinessById(businessId);
    if (data) {
      setSelectedBusiness((prev) => (prev && prev.id === data.id ? data : prev));
      setBusinesses((prev) => prev.map((b) => (b.id === data.id ? data : b)));
    }

    return { success: true };
  };

  // ==================================================
  // NOTIFICATIONS (Supabase-backed)
  // ==================================================

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsRead();
  };

  const handleClearNotifications = () => {
    // Database rows stay safe; this just clears the local tray after all read.
    void markAllNotificationsRead();
    setNotifications([]);
  };

  // ==================================================
  // CHAT
  // ==================================================

  const handleOpenChatWithBusiness = (business: Business) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setChatConversation(null);
    setChatBusiness(business);
    setIsChatOpen(true);
  };

  const handleOpenConversation = (conversation: ChatConversation) => {
    setChatBusiness(null);
    setChatConversation(conversation);
    setIsChatOpen(true);
  };

  // ==================================================
  // FILTERING (client-side over real DB data)
  // ==================================================

  const locationFiltered = locationService.filterBusinessesByLocation(
    businesses,
    filterState.city
  );

  const filteredBusinesses = locationFiltered
    .filter((business) => {
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        const nameMatch = business.name.toLowerCase().includes(query);
        const categoryMatch = business.category.toLowerCase().includes(query);
        const cityMatch = business.city.toLowerCase().includes(query);
        const taglineMatch = business.tagline?.toLowerCase().includes(query);
        const keywordMatch = business.aiKeywords?.some((k) =>
          k.toLowerCase().includes(query)
        );
        if (!nameMatch && !categoryMatch && !cityMatch && !taglineMatch && !keywordMatch) {
          return false;
        }
      }

      if (
        filterState.category !== 'all' &&
        business.category.toLowerCase() !== filterState.category.toLowerCase()
      ) {
        return false;
      }

      if (filterState.verifiedOnly && !business.isVerified) {
        return false;
      }

      if (business.rating < filterState.minRating) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filterState.sortBy === 'rating') return b.rating - a.rating;
      if (filterState.sortBy === 'mostViewed') return b.viewsCount - a.viewsCount;
      return a.createdAt < b.createdAt ? 1 : -1; // newest
    });

  const comparedBusinesses = businesses.filter((b) => comparedIds.includes(b.id));

  // ==================================================
  // AUTH GATE (one-way latch)
  //  - Before the session is restored: show the loader.
  //  - After restore with no user: show the welcome screen.
  //  - ONCE the main app has rendered, the latch makes this gate inert for
  //    the rest of the page's lifetime — no later auth event can ever
  //    unmount the app (or flash the loader over it) again. Only SIGNED_OUT
  //    resets the latch.
  // ==================================================

  if (window.location.pathname === '/reset-password') {
    return <ResetPassword onBack={() => window.location.assign('/')} />;
  }

  if (!authChecked && !mainAppShownRef.current) {
    return <Loader onFinish={handleFinishLoader} />;
  }

  if (!currentUser && !mainAppShownRef.current) {
    return (
      <WelcomeAuthScreen
        onLoginSuccess={(user) => handleLoginSuccess(user)}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Latch ON — from this render onward the main app stays mounted.
  mainAppShownRef.current = true;

  // ==================================================
  // MAIN APP
  // ==================================================

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-clip ${
        isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      <SEOHead />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div
          className={`absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-700 ${
            isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-100/70'
          }`}
        />
        <div
          className={`absolute top-[20%] -right-40 w-[600px] h-[600px] rounded-full blur-[140px] transition-colors duration-700 ${
            isDarkMode ? 'bg-emerald-950/20' : 'bg-emerald-100/60'
          }`}
        />
        <div
          className={`absolute top-[50%] left-[20%] w-[650px] h-[650px] rounded-full blur-[150px] transition-colors duration-700 ${
            isDarkMode ? 'bg-purple-950/20' : 'bg-sky-100/60'
          }`}
        />
      </div>

      {/* Intro loader — never shown again once the main app is latched on. */}
      {loading && !mainAppShownRef.current && <Loader onFinish={handleFinishLoader} />}

      <Navbar
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        currentCity={filterState.city}
        onCityChange={handleSelectCity}
        onNavigate={handleNavigate}
        activeView={currentView === 'contact' ? 'home' : currentView}
        onOpenAiMatchmaker={() => setIsMatchmakerOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        ownedBusinessCount={myBusinesses.length}
      />

      <main className="min-h-screen">
        {(currentView === 'home' || currentView === 'businesses') && (
          <>
            <Hero
              onSearch={handleSearchSubmit}
              onSelectCategory={handleSelectCategory}
              isDarkMode={isDarkMode}
              onOpenAiMatchmaker={() => setIsMatchmakerOpen(true)}
            />

            <LiveStats isDarkMode={isDarkMode} />

            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              selectedCategory={filterState.category}
              isDarkMode={isDarkMode}
            />

            <FeaturedBusinesses
              businesses={filteredBusinesses}
              onViewDetail={handleOpenBusiness}
              onToggleCompare={handleToggleCompare}
              comparedIds={comparedIds}
              filterState={filterState}
              onFilterChange={handleFilterChange}
              isDarkMode={isDarkMode}
              isLoading={businessesLoading}
              error={businessesError}
              onRetry={loadBusinesses}
              onClearFilters={() =>
                setFilterState({
                  searchQuery: '',
                  category: 'all',
                  city: 'all',
                  verifiedOnly: false,
                  minRating: 0,
                  sortBy: 'newest',
                })
              }
              onListBusiness={() => handleNavigate('dashboard')}
            />

            <PakistanMap
              onSelectCity={handleSelectCity}
              selectedCity={filterState.city}
              isDarkMode={isDarkMode}
            />

            <Testimonials isDarkMode={isDarkMode} />

            <PricingSection
              onSelectPlan={() => handleNavigate('dashboard')}
              isDarkMode={isDarkMode}
            />

            <ContactSection isDarkMode={isDarkMode} />
          </>
        )}

        {currentView === 'categories' && (
          <div className="pt-10">
            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              selectedCategory={filterState.category}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'cities' && (
          <div className="pt-10">
            <PakistanMap
              onSelectCity={handleSelectCity}
              selectedCity={filterState.city}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <UserDashboard
            user={currentUser}
            userBusinesses={myBusinesses}
            leads={leads}
            onAddBusiness={handleAddBusiness}
            onUpdateBusiness={handleUpdateBusiness}
            onDeleteBusiness={handleDeleteBusiness}
            onUpgradeToBusiness={handleUpgradeToBusiness}
            onOpenConversation={handleOpenConversation}
            onRefreshBusinesses={refreshMyBusinesses}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'business-profile' && selectedBusiness && (
          <BusinessProfilePage
            business={selectedBusiness}
            onBack={handleProfileBack}
            onSubmitLead={handleSubmitLead}
            onSubmitReview={handleSubmitReview}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            onOpenChat={handleOpenChatWithBusiness}
            onAddToCart={handleAddToCart}
            onOpenDashboard={() => handleNavigate('dashboard')}
            onToggleSave={handleToggleSaveBusiness}
            isSaved={currentUser?.savedBusinessIds.includes(selectedBusiness.id) || false}
            onRequireAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'admin' &&
          (currentUser?.role === 'admin' ? (
            <AdminPanel
              businesses={pendingBusinesses}
              stats={adminStats}
              onApprove={handleApproveBusiness}
              onReject={handleRejectBusiness}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className="py-24 px-4 max-w-lg mx-auto text-center space-y-3">
              <h2 className="text-2xl font-black">Access Denied</h2>
              <p className="text-sm text-slate-400">
                The admin panel requires an administrator account.
              </p>
            </div>
          ))}

        {currentView === 'pricing' && (
          <PricingSection
            onSelectPlan={() => handleNavigate('dashboard')}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'contact' && <ContactSection isDarkMode={isDarkMode} />}
      </main>

      {/* Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-purple-500/50 shadow-2xl flex items-center gap-3">
          <span className="text-xs font-bold text-white px-2">
            Comparing <strong className="text-purple-400">{comparedIds.length}</strong> Providers
          </span>
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
          >
            Open Matrix →
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => handleLoginSuccess(user)}
        isDarkMode={isDarkMode}
      />

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        onUpgradeToBusiness={handleUpgradeToBusiness}
        orders={orders}
        savedBusinesses={savedBusinessesList}
        onSelectBusiness={(business) => {
          setIsSettingsOpen(false);
          void handleOpenBusiness(business);
        }}
        onOpenDashboard={() => handleNavigate('dashboard')}
        isDarkMode={isDarkMode}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onBrowse={() => {
          setIsCartOpen(false);
          handleNavigate('businesses');
        }}
        isDarkMode={isDarkMode}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        user={currentUser}
        onPlaceOrder={handlePlaceOrder}
        onRequireAuth={() => {
          setIsCheckoutOpen(false);
          setIsAuthOpen(true);
        }}
        isDarkMode={isDarkMode}
      />

      <FloatingChatInbox
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        business={chatBusiness}
        conversation={chatConversation}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
      />

      {isCompareOpen && (
        <CompareModal
          businesses={comparedBusinesses}
          onClose={() => setIsCompareOpen(false)}
          onRemove={(id) => {
            const business = businesses.find((item) => item.id === id);
            if (business) handleToggleCompare(business);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      <AiMatchmakerModal
        isOpen={isMatchmakerOpen}
        onClose={() => setIsMatchmakerOpen(false)}
        allBusinesses={businesses}
        onSelectBusiness={(business) => {
          setIsMatchmakerOpen(false);
          void handleOpenBusiness(business);
        }}
        isDarkMode={isDarkMode}
      />

      <Footer
        onNavigate={(view) => handleNavigate(view)}
        onSelectCity={handleSelectCity}
        onSelectCategory={handleSelectCategory}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
