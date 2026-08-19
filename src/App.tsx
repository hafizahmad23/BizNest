import React, { useEffect, useState } from 'react';

import { Loader } from './components/Loader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveStats } from './components/LiveStats';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedBusinesses } from './components/FeaturedBusinesses';
import { PakistanMap } from './components/PakistanMap';
import { BusinessDetailModal } from './components/BusinessDetailModal';
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
import { SEOHead } from './components/SEOHead';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import ResetPassword from './components/ResetPassword';
import {
  getCurrentSupabaseUser,
  logoutFromSupabase,
  subscribeToSupabaseAuthChanges,
  updateSupabaseUserMetadata,
} from './lib/supabaseAuth';

import { supabase } from './lib/supabase';

import {
  MOCK_BUSINESSES,
  MOCK_LEADS,
  MOCK_NOTIFICATIONS,
} from './data/mockData';

import { locationService } from './data/locationService';

import {
  Business,
  FilterState,
  LeadInquiry,
  User,
  CartItem,
  Order,
  AppNotification,
} from './types';

type AppView =
  | 'home'
  | 'businesses'
  | 'categories'
  | 'cities'
  | 'pricing'
  | 'dashboard'
  | 'admin'
  | 'contact';


export default function App() {
  // --------------------------------------------------
  // 1. LOADER
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // 2. THEME
  // --------------------------------------------------

  const [isDarkMode, setIsDarkMode] = useState(false);

  // --------------------------------------------------
  // 3. CURRENT VIEW
  // --------------------------------------------------

  const [currentView, setCurrentView] = useState<AppView>('home');

  // --------------------------------------------------
  // 4. DATA
  // --------------------------------------------------

  const [businesses, setBusinesses] =
    useState<Business[]>(MOCK_BUSINESSES);

  const [leads, setLeads] =
    useState<LeadInquiry[]>(MOCK_LEADS);

  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  // --------------------------------------------------
  // 5. NOTIFICATIONS
  // --------------------------------------------------

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // --------------------------------------------------
  // 6. CURRENT USER / AUTH
  // --------------------------------------------------

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
  let active = true;

  const restoreSession = async () => {
    try {
      const user = await getCurrentSupabaseUser();

      if (!active) {
        return;
      }

      setCurrentUser(user);

      if (user?.role === 'business') {
        setCurrentView('dashboard');
      } else if (user) {
        setCurrentView('home');
      }
    } catch (error) {
      console.error(
        'Failed to restore Supabase session:',
        error
      );

      if (active) {
        setCurrentUser(null);
        setCurrentView('home');
      }
    } finally {
      if (active) {
        setAuthChecked(true);
      }
    }
  };

  void restoreSession();

  const unsubscribe =
    subscribeToSupabaseAuthChanges(
      async (user) => {
        if (!active) {
          return;
        }

        setCurrentUser(user);

        if (user?.role === 'business') {
          setCurrentView('dashboard');
        } else if (user) {
          setCurrentView('home');
        } else {
          setCurrentView('home');
        }

        setAuthChecked(true);
      }
    );

  return () => {
    active = false;
    unsubscribe();
  };
}, []);

  // --------------------------------------------------
  // 7. LOGIN SUCCESS
  // --------------------------------------------------

  const handleLoginSuccess = (
    user: User,
    rememberMe: boolean = true
  ) => {
    setCurrentUser(user);

    // Automatically create a business listing
    // for a new business account.
    if (
      user.role === 'business' &&
      user.businessName
    ) {
      const businessName = user.businessName;

      setBusinesses((prev) => {
        const existing = prev.find(
          (business) =>
            business.ownerId === user.id ||
            business.name.toLowerCase() ===
              businessName.toLowerCase()
        );

        if (existing) {
          return prev;
        }

        const newBusiness: Business = {
          id:
            user.businessId ||
            `biz-${Date.now()}`,

          ownerId: user.id,

          name: user.businessName || `${user.name}'s Business`,

          tagline:
            'Verified Commercial Merchant',

          category:
            'Botanical & Nursery',

          city:
            user.city || 'Lahore',

          address:
            `Commercial Zone, Block B, ${
              user.city || 'Lahore'
            }`,

          phone:
            user.phone ||
            '+92 300 0000000',

          whatsapp:
            user.phone
              ? user.phone.replace(
                  /[^0-9]/g,
                  ''
                )
              : '923000000000',

          email:
            user.email,

          coverImage:
            'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',

          logoImage:
            'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',

          galleryImages: [
            'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
          ],

          description:
            `${businessName} is a premier verified provider offering high quality products and commercial services in ${
              user.city || 'Lahore'
            }, Pakistan.`,

          trustScore: 98,

          popularityScore: 95,

          responseTime:
            '< 15 mins',

          isVerified: true,

          isFeatured: true,

          isPremium: true,

          status: 'active',

          rating: 5.0,

          reviewCount: 1,

          isOpenNow: true,

          operatingHours:
            'Mon - Sat: 9:00 AM - 8:00 PM',

          priceRange:
            'PKR 💸💸',

          productsServices: [
            {
              id: `p-${Date.now()}`,

              name:
                'Standard Commercial Package',

              numericPrice: 2500,

              price:
                'PKR 2,500',

              description:
                'Featured catalog item with verified guarantee.',

              image:
                'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
            },
          ],

          reviews: [
            {
              id: `rev-${Date.now()}`,

              userName:
                'Ayesha Malik',

              userCity:
                user.city || 'Lahore',

              rating: 5,

              date: 'Just now',

              comment:
                'Excellent customer service and top quality delivery!',
            },
          ],

          viewsCount: 142,

          leadsCount: 18,

          savedCount: 24,

          createdAt:
            new Date()
              .toISOString()
              .split('T')[0],
        };

        return [
          newBusiness,
          ...prev,
        ];
      });

      setCurrentView('dashboard');
    } else if (
      user.role === 'business'
    ) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('home');
    }
  };

  // --------------------------------------------------
  // 8. LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    setCurrentUser(null);

    void logoutFromSupabase();

    setCurrentView('home');
  };

  // --------------------------------------------------
  // 9. MODALS
  // --------------------------------------------------

  const [isAuthOpen, setIsAuthOpen] =
    useState(false);

  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] =
    useState(false);

  const [isChatOpen, setIsChatOpen] =
    useState(false);

  const [chatBusiness, setChatBusiness] =
    useState<Business | null>(null);

  // --------------------------------------------------
  // 10. CART / ORDERS
  // --------------------------------------------------

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  // --------------------------------------------------
  // 11. FILTERS
  // --------------------------------------------------

  const [filterState, setFilterState] =
    useState<FilterState>({
      searchQuery: '',
      category: 'all',
      city: 'all',
      verifiedOnly: false,
      openNowOnly: false,
      minRating: 0,
      minTrustScore: 0,
      sortBy: 'trustScore',
    });

  // --------------------------------------------------
  // 12. SELECTED BUSINESS
  // --------------------------------------------------

  const [selectedBusiness, setSelectedBusiness] =
    useState<Business | null>(null);

  // --------------------------------------------------
  // 13. COMPARE
  // --------------------------------------------------

  const [comparedIds, setComparedIds] =
    useState<string[]>([]);

  const [isCompareOpen, setIsCompareOpen] =
    useState(false);

  // --------------------------------------------------
  // 14. AI MATCHMAKER
  // --------------------------------------------------

  const [isMatchmakerOpen, setIsMatchmakerOpen] =
    useState(false);

  // --------------------------------------------------
  // 15. FETCH BUSINESSES
  // --------------------------------------------------

  useEffect(() => {
    fetch('/api/businesses')
      .then((response) => response.json())
      .then((data) => {
        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          setBusinesses(data);
        }
      })
      .catch((error) => {
        console.warn(
          'Using local fallback mock businesses:',
          error
        );
      });
  }, []);

  // --------------------------------------------------
  // 16. LOADER
  // --------------------------------------------------

  const handleFinishLoader = () => {
    setLoading(false);
  };

  // --------------------------------------------------
  // 17. THEME
  // --------------------------------------------------

  const handleToggleTheme = () => {
    setIsDarkMode(
      (previous) => !previous
    );
  };

  // --------------------------------------------------
  // 18. NAVIGATION
  // --------------------------------------------------

  const handleNavigate = (
    view: AppView
  ) => {
    setCurrentView(view);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // --------------------------------------------------
  // 19. CITY SELECT
  // --------------------------------------------------

  const handleSelectCity = (
    city: string
  ) => {
    setFilterState(
      (previous) => ({
        ...previous,
        city,
      })
    );

    setCurrentView(
      'businesses'
    );

    const element =
      document.getElementById(
        'featured-businesses'
      );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  // --------------------------------------------------
  // 20. CATEGORY SELECT
  // --------------------------------------------------

  const handleSelectCategory = (
    category: string
  ) => {
    setFilterState(
      (previous) => ({
        ...previous,
        category,
      })
    );

    setCurrentView(
      'businesses'
    );

    const element =
      document.getElementById(
        'featured-businesses'
      );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  // --------------------------------------------------
  // 21. SEARCH
  // --------------------------------------------------

  const handleSearchSubmit = (
    query: string,
    category: string,
    city: string,
    verifiedOnly: boolean = false
  ) => {
    setFilterState(
      (previous) => ({
        ...previous,
        searchQuery: query,
        category: category || 'all',
        city: city || 'all',
        verifiedOnly,
      })
    );

    setCurrentView(
      'businesses'
    );

    const element =
      document.getElementById(
        'featured-businesses'
      );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  // --------------------------------------------------
  // 22. FILTER CHANGE
  // --------------------------------------------------

  const handleFilterChange = (
    newFilters: Partial<FilterState>
  ) => {
    setFilterState(
      (previous) => ({
        ...previous,
        ...newFilters,
      })
    );
  };

  // --------------------------------------------------
  // 23. COMPARE
  // --------------------------------------------------

  const handleToggleCompare = (
    business: Business
  ) => {
    setComparedIds(
      (previous) => {
        if (
          previous.includes(
            business.id
          )
        ) {
          return previous.filter(
            (id) =>
              id !== business.id
          );
        }

        if (previous.length >= 3) {
          alert(
            'You can compare a maximum of 3 businesses simultaneously.'
          );

          return previous;
        }

        return [
          ...previous,
          business.id,
        ];
      }
    );
  };

  // --------------------------------------------------
  // 24. CART
  // --------------------------------------------------

  const handleAddToCart = (
    item: CartItem
  ) => {
    setCartItems(
      (previous) => {
        const existing =
          previous.find(
            (cartItem) =>
              cartItem.productId ===
              item.productId
          );

        if (existing) {
          return previous.map(
            (cartItem) =>
              cartItem.productId ===
              item.productId
                ? {
                    ...cartItem,
                    quantity:
                      cartItem.quantity + 1,
                  }
                : cartItem
          );
        }

        return [
          ...previous,
          item,
        ];
      }
    );

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
    id: string,
    delta: number
  ) => {
    setCartItems(
      (previous) =>
        previous
          .map((item) => {
            if (
              item.id === id
            ) {
              const newQuantity =
                item.quantity +
                delta;

              return newQuantity >
                0
                ? {
                    ...item,
                    quantity:
                      newQuantity,
                  }
                : null;
            }

            return item;
          })
          .filter(
            (
              item
            ): item is CartItem =>
              item !== null
          )
    );
  };

  const handleRemoveCartItem = (
    id: string
  ) => {
    setCartItems(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // --------------------------------------------------
  // 25. ORDER PLACED
  // --------------------------------------------------

  const handleOrderPlaced = (
    newOrder: Order
  ) => {
    setOrders(
      (previous) => [
        newOrder,
        ...previous,
      ]
    );

    setCartItems([]);

    const notification: AppNotification =
      {
        id: `notif-${Date.now()}`,

        title:
          'Order Placed Successfully',

        message:
          `Your order for PKR ${newOrder.totalAmount.toLocaleString()} has been placed via ${newOrder.paymentMethod.toUpperCase()}.`,

        timestamp:
          'Just now',

        isRead: false,

        type: 'order',
      };

    setNotifications(
      (previous) => [
        notification,
        ...previous,
      ]
    );
  };

  // --------------------------------------------------
  // 26. UPGRADE TO BUSINESS
  // --------------------------------------------------

 const handleUpgradeToBusiness = async () => {
  if (!currentUser) {
    return;
  }

  const businessName =
    currentUser.businessName?.trim() ||
    `${currentUser.name}'s Business`;

  const result = await updateSupabaseUserMetadata({
    role: 'business',
    businessName,
  });

  if (!result.success || !result.user) {
    console.error(
      'BizNest business upgrade failed:',
      result.error
    );

    alert(
      result.error ||
        'Business account upgrade could not be saved. Please try again.'
    );

    return;
  }

  setCurrentUser(result.user);
  setCurrentView('dashboard');
  setIsSettingsOpen(false);

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

  // --------------------------------------------------
  // 27. ADD BUSINESS
  // --------------------------------------------------

  const handleAddBusiness = (
    newBiz: Partial<Business>
  ) => {
    const created: Business = {
      id: `biz-${Date.now()}`,

      ownerId:
        currentUser?.id ||
        'merchant-1',

      name:
        newBiz.name ||
        'New Business',

      category:
        newBiz.category ||
        'Nursery',

      city:
        newBiz.city ||
        'Lahore',

      tagline:
        newBiz.tagline ||
        '',

      description:
        newBiz.description ||
        '',

      phone:
        newBiz.phone ||
        '+92 300 1234567',

      whatsapp:
        newBiz.whatsapp ||
        '+923001234567',

      email:
        newBiz.email ||
        'info@business.pk',

      address:
        `${newBiz.city || 'Lahore'}, Pakistan`,

      coverImage:
        newBiz.coverImage ||
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',

      logoImage:
        newBiz.logoImage ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80',

      isVerified: false,

      isFeatured: false,

      isPremium: true,

      trustScore: 85,

      responseTime:
        '< 15 mins',

      operatingHours:
        '09:00 AM - 09:00 PM',

      rating: 5.0,

      reviewCount: 1,

      priceRange:
        'PKR 💸💸',

      status: 'pending',

      viewsCount: 12,

      leadsCount: 0,

      popularityScore: 70,

      galleryImages:
        newBiz.galleryImages ||
        [
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
        ],

      productsServices:
        newBiz.productsServices ||
        [
          {
            id: `p-${Date.now()}`,

            name:
              'Standard Package',

            description:
              'High quality services provided across Pakistan.',

            price:
              'PKR 1,500',
          },
        ],

      reviews:
        newBiz.reviews ||
        [],

      aiKeywords:
        newBiz.aiKeywords ||
        [
          newBiz.category || '',
          newBiz.city || '',
        ],

      isOpenNow: true,

      savedCount: 0,

      createdAt:
        new Date()
          .toISOString()
          .split('T')[0],
    };

    setBusinesses(
      (previous) => [
        created,
        ...previous,
      ]
    );

    fetch('/api/businesses', {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(
        created
      ),
    }).catch((error) =>
      console.warn(
        'Saved locally:',
        error
      )
    );
  };

  // --------------------------------------------------
  // 28. UPDATE BUSINESS
  // --------------------------------------------------

  const handleUpdateBusiness = (
    updatedBusiness: Business
  ) => {
    setBusinesses(
      (previous) =>
        previous.map(
          (business) =>
            business.id ===
            updatedBusiness.id
              ? {
                  ...business,
                  ...updatedBusiness,
                }
              : business
        )
    );

    fetch(
      `/api/businesses/${updatedBusiness.id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          updatedBusiness
        ),
      }
    ).catch((error) =>
      console.warn(
        'Updated locally:',
        error
      )
    );

    const notification:
      AppNotification = {
        id: `notif-${Date.now()}`,

        title:
          'Business Details Updated',

        message:
          `Listing "${updatedBusiness.name}" details were updated and published live.`,

        timestamp:
          'Just now',

        isRead: false,

        type:
          'business_status',
      };

    setNotifications(
      (previous) => [
        notification,
        ...previous,
      ]
    );
  };

  // --------------------------------------------------
  // 29. DELETE BUSINESS
  // --------------------------------------------------

  const handleDeleteBusiness = (
    businessId: string
  ) => {
    const targetBusiness =
      businesses.find(
        (business) =>
          business.id ===
          businessId
      );

    setBusinesses(
      (previous) =>
        previous.filter(
          (business) =>
            business.id !==
            businessId
        )
    );

    fetch(
      `/api/businesses/${businessId}`,
      {
        method: 'DELETE',
      }
    ).catch((error) =>
      console.warn(
        'Deleted locally:',
        error
      )
    );

    if (targetBusiness) {
      const notification:
        AppNotification = {
          id: `notif-${Date.now()}`,

          title:
            'Business Deleted',

          message:
            `Listing "${targetBusiness.name}" was removed from your business portfolio.`,

          timestamp:
            'Just now',

          isRead: false,

          type:
            'business_status',
        };

      setNotifications(
        (previous) => [
          notification,
          ...previous,
        ]
      );
    }
  };

  // --------------------------------------------------
  // 30. APPROVE BUSINESS
  // --------------------------------------------------

  const handleApproveBusiness = (
    id: string
  ) => {
    const targetBusiness =
      businesses.find(
        (business) =>
          business.id === id
      );

    setBusinesses(
      (previous) =>
        previous.map(
          (business) =>
            business.id === id
              ? {
                  ...business,
                  isVerified:
                    true,
                  status:
                    'active',
                  trustScore:
                    98,
                }
              : business
        )
    );

    if (targetBusiness) {
      const notification:
        AppNotification = {
          id: `notif-${Date.now()}`,

          title:
            'Business Verified & Approved',

          message:
            `Listing "${targetBusiness.name}" status was updated to Verified Active Gold Shield!`,

          timestamp:
            'Just now',

          isRead: false,

          type:
            'business_status',
        };

      setNotifications(
        (previous) => [
          notification,
          ...previous,
        ]
      );
    }
  };

  // --------------------------------------------------
  // 31. REJECT BUSINESS
  // --------------------------------------------------

  const handleRejectBusiness = (
    id: string
  ) => {
    setBusinesses(
      (previous) =>
        previous.filter(
          (business) =>
            business.id !== id
        )
    );
  };

  // --------------------------------------------------
  // 32. LEAD INQUIRY
  // --------------------------------------------------

  const handleSubmitLead = (
    businessId: string,
    name: string,
    phone: string,
    email: string,
    message: string
  ) => {
    const targetBusiness =
      businesses.find(
        (business) =>
          business.id ===
          businessId
      );

    const newLead: LeadInquiry =
      {
        id: `lead-${Date.now()}`,

        businessId,

        businessName:
          targetBusiness
            ? targetBusiness.name
            : 'Business Listing',

        senderName:
          name,

        senderPhone:
          phone,

        senderEmail:
          email,

        city:
          targetBusiness
            ? targetBusiness.city
            : 'Lahore',

        message,

        createdAt:
          new Date().toLocaleDateString(),

        status: 'new',
      };

    setLeads(
      (previous) => [
        newLead,
        ...previous,
      ]
    );

    const notification:
      AppNotification = {
        id: `notif-${Date.now()}`,

        title:
          'Inquiry Sent',

        message:
          `Your inquiry to "${targetBusiness ? targetBusiness.name : 'Business'}" was sent. You will be alerted when they reply.`,

        timestamp:
          'Just now',

        isRead: false,

        type:
          'inquiry_reply',
      };

    setNotifications(
      (previous) => [
        notification,
        ...previous,
      ]
    );

    fetch('/api/leads', {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(
        newLead
      ),
    }).catch((error) =>
      console.warn(
        'Saved lead locally:',
        error
      )
    );
  };

  // --------------------------------------------------
  // 33. REVIEW
  // --------------------------------------------------

  const handleSubmitReview = (
    businessId: string,
    name: string,
    rating: number,
    comment: string
  ) => {
    setBusinesses(
      (previous) =>
        previous.map(
          (business) => {
            if (
              business.id !==
              businessId
            ) {
              return business;
            }

            const newReview = {
              id: `rev-${Date.now()}`,

              userName:
                name,

              userCity:
                'Pakistan',

              rating,

              comment,

              date:
                new Date().toLocaleDateString(),
            };

            const updatedReviews =
              [
                newReview,
                ...business.reviews,
              ];

            const averageRating =
              Number(
                (
                  updatedReviews.reduce(
                    (
                      total,
                      review
                    ) =>
                      total +
                      review.rating,
                    0
                  ) /
                  updatedReviews.length
                ).toFixed(1)
              );

            return {
              ...business,

              reviews:
                updatedReviews,

              rating:
                averageRating,

              reviewCount:
                updatedReviews.length,
            };
          }
        )
    );
  };

  // --------------------------------------------------
  // 34. FILTERED BUSINESSES
  // --------------------------------------------------

  const locationFiltered =
    locationService.filterBusinessesByLocation(
      businesses,
      filterState.city
    );

  const filteredBusinesses =
    locationFiltered
      .filter((business) => {
        if (
          filterState.searchQuery
        ) {
          const query =
            filterState.searchQuery.toLowerCase();

          const nameMatch =
            business.name
              .toLowerCase()
              .includes(query);

          const categoryMatch =
            business.category
              .toLowerCase()
              .includes(query);

          const cityMatch =
            business.city
              .toLowerCase()
              .includes(query);

          const taglineMatch =
            business.tagline
              ?.toLowerCase()
              .includes(query);

          const keywordMatch =
            business.aiKeywords?.some(
              (keyword) =>
                keyword
                  .toLowerCase()
                  .includes(query)
            );

          if (
            !nameMatch &&
            !categoryMatch &&
            !cityMatch &&
            !taglineMatch &&
            !keywordMatch
          ) {
            return false;
          }
        }

        if (
          filterState.category !==
            'all' &&
          business.category
            .toLowerCase() !==
            filterState.category.toLowerCase()
        ) {
          return false;
        }

        if (
          filterState.verifiedOnly &&
          !business.isVerified
        ) {
          return false;
        }

        if (
          filterState.openNowOnly &&
          !business.isOpenNow
        ) {
          return false;
        }

        if (
          business.rating <
          filterState.minRating
        ) {
          return false;
        }

        if (
          business.trustScore <
          filterState.minTrustScore
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) => {
          if (
            filterState.sortBy ===
            'trustScore'
          ) {
            return (
              b.trustScore -
              a.trustScore
            );
          }

          if (
            filterState.sortBy ===
            'popularityScore'
          ) {
            return (
              b.popularityScore -
              a.popularityScore
            );
          }

          if (
            filterState.sortBy ===
            'rating'
          ) {
            return (
              b.rating -
              a.rating
            );
          }

          return 0;
        }
      );

  // --------------------------------------------------
  // 35. OTHER DERIVED DATA
  // --------------------------------------------------

  const comparedBusinesses =
    businesses.filter(
      (business) =>
        comparedIds.includes(
          business.id
        )
    );

  const savedBusinesses =
    businesses.filter(
      (business) =>
        currentUser?.savedBusinessIds?.includes(
          business.id
        )
    );

  const userOwnedBusinesses =
    currentUser?.role ===
    'business'
      ? businesses.filter(
          (business) =>
            business.ownerId ===
              currentUser.id ||
            business.id ===
              currentUser.businessId
        )
      : [];

  // --------------------------------------------------
  // 36. AUTH GATE
  // --------------------------------------------------

  if (window.location.pathname === '/reset-password') {
    return <ResetPassword onBack={() => window.location.assign('/')} />;
  }

  if (!authChecked) {
    return <Loader onFinish={handleFinishLoader} />;
  }

  if (!loading && !currentUser) {
    return (
      <WelcomeAuthScreen
        onLoginSuccess={(
          user,
          rememberMe
        ) =>
          handleLoginSuccess(
            user,
            rememberMe
          )
        }
        isDarkMode={
          isDarkMode
        }
      />
    );
  }

  // --------------------------------------------------
  // 37. MAIN APP
  // --------------------------------------------------

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden ${
        isDarkMode
          ? 'bg-[#0f172a] text-slate-100'
          : 'bg-white text-slate-900'
      }`}
    >
      {/* SEO */}
      <SEOHead />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
        <div
          className={`absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-700 ${
            isDarkMode
              ? 'bg-indigo-900/20'
              : 'bg-indigo-100/70'
          }`}
        />

        <div
          className={`absolute top-[20%] -right-40 w-[600px] h-[600px] rounded-full blur-[140px] transition-colors duration-700 ${
            isDarkMode
              ? 'bg-emerald-950/20'
              : 'bg-emerald-100/60'
          }`}
        />

        <div
          className={`absolute top-[50%] left-[20%] w-[650px] h-[650px] rounded-full blur-[150px] transition-colors duration-700 ${
            isDarkMode
              ? 'bg-purple-950/20'
              : 'bg-sky-100/60'
          }`}
        />
      </div>

      {/* Loader */}
      {loading && (
        <Loader
          onFinish={
            handleFinishLoader
          }
        />
      )}

      {/* Navbar */}
      <Navbar
        isDarkMode={
          isDarkMode
        }
        onToggleTheme={
          handleToggleTheme
        }
        currentCity={
          filterState.city
        }
        onCityChange={
          handleSelectCity
        }
        onNavigate={
          handleNavigate
        }
        activeView={
          currentView ===
            'contact'
            ? 'home'
            : currentView
        }
        onOpenAiMatchmaker={() =>
          setIsMatchmakerOpen(
            true
          )
        }
        currentUser={
          currentUser
        }
        onOpenAuth={() =>
          setIsAuthOpen(
            true
          )
        }
        onOpenSettings={() =>
          setIsSettingsOpen(
            true
          )
        }
        onOpenCart={() =>
          setIsCartOpen(
            true
          )
        }
        cartItemCount={cartItems.reduce(
          (total, item) =>
            total +
            item.quantity,
          0
        )}
        onLogout={
          handleLogout
        }
        notifications={
          notifications
        }
        onMarkNotificationRead={
          handleMarkNotificationRead
        }
        onMarkAllNotificationsRead={
          handleMarkAllNotificationsRead
        }
        onClearNotifications={
          handleClearNotifications
        }
      />

      {/* Main */}
      <main className="min-h-screen">
        {/* HOME / BUSINESSES */}
        {(currentView ===
          'home' ||
          currentView ===
            'businesses') && (
          <>
            <Hero
              onSearch={
                handleSearchSubmit
              }
              onSelectCategory={
                handleSelectCategory
              }
              isDarkMode={
                isDarkMode
              }
              onOpenAiMatchmaker={() =>
                setIsMatchmakerOpen(
                  true
                )
              }
            />

            <LiveStats
              isDarkMode={
                isDarkMode
              }
            />

            <CategoryGrid
  onSelectCategory={handleSelectCategory}
  selectedCategory={filterState.category}
  isDarkMode={isDarkMode}
/>

            <FeaturedBusinesses
              businesses={
                filteredBusinesses
              }
              onViewDetail={(
                business
              ) =>
                setSelectedBusiness(
                  business
                )
              }
              onToggleCompare={
                handleToggleCompare
              }
              comparedIds={
                comparedIds
              }
              filterState={
                filterState
              }
              onFilterChange={
                handleFilterChange
              }
              isDarkMode={
                isDarkMode
              }
            />

            <PakistanMap
              onSelectCity={
                handleSelectCity
              }
              selectedCity={
                filterState.city
              }
              isDarkMode={
                isDarkMode
              }
            />

            <Testimonials
              isDarkMode={
                isDarkMode
              }
            />

            <PricingSection
              onSelectPlan={() =>
                handleNavigate(
                  'dashboard'
                )
              }
              isDarkMode={
                isDarkMode
              }
            />

            <ContactSection
              isDarkMode={
                isDarkMode
              }
            />
          </>
        )}

        {/* CATEGORIES */}
        {currentView ===
          'categories' && (
          <div className="pt-10">
           <CategoryGrid
  onSelectCategory={handleSelectCategory}
  selectedCategory={filterState.category}
  isDarkMode={isDarkMode}
/>
          </div>
        )}

        {/* CITIES */}
        {currentView ===
          'cities' && (
          <div className="pt-10">
            <PakistanMap
              onSelectCity={
                handleSelectCity
              }
              selectedCity={
                filterState.city
              }
              isDarkMode={
                isDarkMode
              }
            />
          </div>
        )}

        {/* DASHBOARD */}
        {currentView ===
          'dashboard' && (
          <UserDashboard
            user={
              currentUser
            }
            userBusinesses={
              userOwnedBusinesses.length >
              0
                ? userOwnedBusinesses
                : businesses.slice(
                    0,
                    2
                  )
            }
            leads={leads}
            onAddBusiness={
              handleAddBusiness
            }
            onUpdateBusiness={
              handleUpdateBusiness
            }
            onDeleteBusiness={
              handleDeleteBusiness
            }
            onUpgradeToBusiness={
              handleUpgradeToBusiness
            }
            isDarkMode={
              isDarkMode
            }
          />
        )}

        {/* ADMIN */}
        {currentView ===
          'admin' && (
          <AdminPanel
            businesses={
              businesses
            }
            onApprove={
              handleApproveBusiness
            }
            onReject={
              handleRejectBusiness
            }
            isDarkMode={
              isDarkMode
            }
          />
        )}

        {/* PRICING */}
        {currentView ===
          'pricing' && (
          <PricingSection
            onSelectPlan={() =>
              handleNavigate(
                'dashboard'
              )
            }
            isDarkMode={
              isDarkMode
            }
          />
        )}

        {/* CONTACT */}
        {currentView ===
          'contact' && (
          <ContactSection
            isDarkMode={
              isDarkMode
            }
          />
        )}
      </main>

      {/* Compare Bar */}
      {comparedIds.length >
        0 && (
        <div className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-purple-500/50 shadow-2xl flex items-center gap-3">
          <span className="text-xs font-bold text-white px-2">
            Comparing{' '}
            <strong className="text-purple-400">
              {
                comparedIds.length
              }
            </strong>{' '}
            Providers
          </span>

          <button
            type="button"
            onClick={() =>
              setIsCompareOpen(
                true
              )
            }
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
          >
            Open Matrix →
          </button>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={
          isAuthOpen
        }
        onClose={() =>
          setIsAuthOpen(
            false
          )
        }
        onSuccess={(user) =>
          handleLoginSuccess(
            user,
            true
          )
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* ACCOUNT SETTINGS */}
      <AccountSettingsModal
        isOpen={
          isSettingsOpen
        }
        onClose={() =>
          setIsSettingsOpen(
            false
          )
        }
        user={
          currentUser
        }
        onUpgradeToBusiness={
          handleUpgradeToBusiness
        }
        orders={
          orders
        }
        savedBusinesses={
          savedBusinesses
        }
        onSelectBusiness={(
          business
        ) =>
          setSelectedBusiness(
            business
          )
        }
        onOpenDashboard={() =>
          handleNavigate(
            'dashboard'
          )
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* CART */}
      <CartDrawer
        isOpen={
          isCartOpen
        }
        onClose={() =>
          setIsCartOpen(
            false
          )
        }
        items={
          cartItems
        }
        onUpdateQuantity={
          handleUpdateCartQuantity
        }
        onRemoveItem={
          handleRemoveCartItem
        }
        onClearCart={
          handleClearCart
        }
        onProceedToCheckout={() =>
          setIsCheckoutOpen(
            true
          )
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* CHECKOUT */}
      <CheckoutModal
        isOpen={
          isCheckoutOpen
        }
        onClose={() =>
          setIsCheckoutOpen(
            false
          )
        }
        items={
          cartItems
        }
        user={
          currentUser
        }
        onOrderPlaced={
          handleOrderPlaced
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* CHAT */}
      <ChatModal
        isOpen={
          isChatOpen
        }
        onClose={() =>
          setIsChatOpen(
            false
          )
        }
        business={
          chatBusiness
        }
        currentUser={
          currentUser
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* BUSINESS DETAIL */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={
            selectedBusiness
          }
          onClose={() =>
            setSelectedBusiness(
              null
            )
          }
          onSubmitLead={
            handleSubmitLead
          }
          onSubmitReview={
            handleSubmitReview
          }
          isDarkMode={
            isDarkMode
          }
          currentUser={
            currentUser
          }
          onOpenChat={(
            business
          ) => {
            setChatBusiness(
              business
            );

            setIsChatOpen(
              true
            );
          }}
          onAddToCart={
            handleAddToCart
          }
          onOpenDashboard={() =>
            handleNavigate(
              'dashboard'
            )
          }
        />
      )}

      {/* COMPARE */}
      {isCompareOpen && (
        <CompareModal
          businesses={
            comparedBusinesses
          }
          onClose={() =>
            setIsCompareOpen(
              false
            )
          }
          onRemove={(id) => {
            const business =
              businesses.find(
                (item) =>
                  item.id === id
              );

            if (business) {
              handleToggleCompare(
                business
              );
            }
          }}
          isDarkMode={
            isDarkMode
          }
        />
      )}

      {/* AI MATCHMAKER */}
      <AiMatchmakerModal
        isOpen={
          isMatchmakerOpen
        }
        onClose={() =>
          setIsMatchmakerOpen(
            false
          )
        }
        allBusinesses={
          businesses
        }
        onSelectBusiness={(
          business
        ) =>
          setSelectedBusiness(
            business
          )
        }
        isDarkMode={
          isDarkMode
        }
      />

      {/* FOOTER */}
      <Footer
        onNavigate={(view) => {
          handleNavigate(view);
        }}
        onSelectCity={
          handleSelectCity
        }
        onSelectCategory={
          handleSelectCategory
        }
        isDarkMode={
          isDarkMode
        }
      />
    </div>
  );
}
