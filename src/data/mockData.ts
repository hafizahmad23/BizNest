// ============================================================================
// BizNest Pakistan — Static reference data ONLY
// ----------------------------------------------------------------------------
// This file previously contained FAKE businesses, FAKE reviews, FAKE platform
// statistics and FAKE category/city counts. ALL of that has been REMOVED.
//
// What remains here is only static reference data:
//  - the 16 category definitions (name/icon/description — counts come from DB)
//  - city names + coordinates (business counts come from DB)
//
// Runtime data (businesses, reviews, leads, notifications, counts) now lives
// 100% in Supabase and is accessed through src/lib/supabaseDB.ts.
// ============================================================================

import { Business, CategoryItem, CityItem, PlatformStats, LeadInquiry, AppNotification } from '../types';

/**
 * @deprecated Live platform statistics always come from
 * supabaseDB.fetchPlatformStats(). This zeroed export only exists so older
 * imports fail soft instead of silently showing fabricated numbers.
 */
export const PLATFORM_STATS: PlatformStats = {
  totalBusinesses: 0,
  totalCities: 0,
  totalReviews: 0,
  totalCategories: 0,
};

/**
 * The 16 canonical BizNest category definitions. `count` is intentionally 0
 * here — real counts are merged from the database at runtime
 * (supabaseDB.fetchCategories() / fetchCategoryCounts()).
 */
export const POPULAR_CATEGORIES: CategoryItem[] = [
  { id: 'botanical-nursery', name: 'Botanical & Nursery', slug: 'botanical-nursery', iconName: 'Sprout', count: 0, description: 'Plants, seeds, landscaping, gardening supplies & nurseries', popularCities: ['Lahore', 'Islamabad', 'Karachi'] },
  { id: 'restaurants-cafes', name: 'Restaurants & Cafes', slug: 'restaurants-cafes', iconName: 'Utensils', count: 0, description: 'Pakistani cuisine, fast food, bakeries, coffee shops & fine dining', popularCities: ['Lahore', 'Karachi', 'Peshawar'] },
  { id: 'doctors-clinics', name: 'Doctors & Clinics', slug: 'doctors-clinics', iconName: 'Stethoscope', count: 0, description: 'Specialist doctors, dental clinics, skin centers & private practices', popularCities: ['Lahore', 'Karachi', 'Rawalpindi'] },
  { id: 'electricians-solar', name: 'Electricians & Solar', slug: 'electricians-solar', iconName: 'Wrench', count: 0, description: 'Electricians, AC technicians, solar installers & repair services', popularCities: ['Lahore', 'Multan', 'Faisalabad'] },
  { id: 'real-estate-plots', name: 'Real Estate & Plots', slug: 'real-estate-plots', iconName: 'Home', count: 0, description: 'Plots, houses, commercial property dealers & investment advisors', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'software-freelancers', name: 'Software & Freelancers', slug: 'software-freelancers', iconName: 'Laptop', count: 0, description: 'Software houses, web developers, designers & digital agencies', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'lawyers-legal-aid', name: 'Lawyers & Legal Aid', slug: 'lawyers-legal-aid', iconName: 'Scale', count: 0, description: 'Advocates, corporate lawyers, tax consultants & legal documentation', popularCities: ['Islamabad', 'Lahore', 'Karachi'] },
  { id: 'solar-energy-systems', name: 'Solar & Energy Systems', slug: 'solar-energy-systems', iconName: 'Zap', count: 0, description: 'Solar panels, inverters, net metering & backup power solutions', popularCities: ['Lahore', 'Multan', 'Rawalpindi'] },
  { id: 'hotels-guest-houses', name: 'Hotels & Guest Houses', slug: 'hotels-guest-houses', iconName: 'Hotel', count: 0, description: 'Hotels, guest houses, resorts & short-stay accommodation', popularCities: ['Islamabad', 'Peshawar', 'Rawalpindi'] },
  { id: 'hospitals-diagnostics', name: 'Hospitals & Diagnostics', slug: 'hospitals-diagnostics', iconName: 'Hospital', count: 0, description: 'Hospitals, laboratories, imaging centers & emergency care', popularCities: ['Lahore', 'Karachi', 'Faisalabad'] },
  { id: 'retail-wholesale', name: 'Retail & Wholesale', slug: 'retail-wholesale', iconName: 'ShoppingBag', count: 0, description: 'Shops, wholesale dealers, distributors & general stores', popularCities: ['Karachi', 'Lahore', 'Multan'] },
  { id: 'plumbers-home-repairs', name: 'Plumbers & Home Repairs', slug: 'plumbers-home-repairs', iconName: 'Droplets', count: 0, description: 'Plumbers, painters, carpenters & home maintenance services', popularCities: ['Lahore', 'Karachi', 'Rawalpindi'] },
  { id: 'academies-tutors', name: 'Academies & Tutors', slug: 'academies-tutors', iconName: 'GraduationCap', count: 0, description: 'Coaching academies, home tutors, language & IT institutes', popularCities: ['Lahore', 'Rawalpindi', 'Islamabad'] },
  { id: 'salons-spas', name: 'Salons & Spas', slug: 'salons-spas', iconName: 'Scissors', count: 0, description: 'Beauty parlors, barber shops, spas & grooming services', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
  { id: 'photographers-media', name: 'Photographers & Media', slug: 'photographers-media', iconName: 'Camera', count: 0, description: 'Wedding photographers, videographers, studios & media production', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
  { id: 'gyms-fitness-centers', name: 'Gyms & Fitness Centers', slug: 'gyms-fitness-centers', iconName: 'Dumbbell', count: 0, description: 'Gyms, fitness trainers, yoga studios & sports facilities', popularCities: ['Lahore', 'Karachi', 'Islamabad'] },
];

/**
 * Reference list of major Pakistani cities (names + coordinates only).
 * `businessCount` is intentionally 0 — real counts are merged from the
 * database at runtime (supabaseDB.fetchCityBusinessCounts()).
 */
export const PAKISTAN_CITIES: CityItem[] = [
  { id: 'lahore', name: 'Lahore', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1588096344356-9b343e8d2847?auto=format&fit=crop&w=600&q=80', lat: 31.5204, lng: 74.3587 },
  { id: 'karachi', name: 'Karachi', province: 'Sindh', businessCount: 0, image: 'https://images.unsplash.com/photo-1627837042769-122e11e03a9f?auto=format&fit=crop&w=600&q=80', lat: 24.8607, lng: 67.0011 },
  { id: 'islamabad', name: 'Islamabad', province: 'ICT', businessCount: 0, image: 'https://images.unsplash.com/photo-1608248597260-24449830f305?auto=format&fit=crop&w=600&q=80', lat: 33.6844, lng: 73.0479 },
  { id: 'rawalpindi', name: 'Rawalpindi', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80', lat: 33.5651, lng: 73.0169 },
  { id: 'multan', name: 'Multan', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80', lat: 30.1575, lng: 71.5249 },
  { id: 'peshawar', name: 'Peshawar', province: 'Khyber Pakhtunkhwa', businessCount: 0, image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80', lat: 34.0151, lng: 71.5249 },
  { id: 'faisalabad', name: 'Faisalabad', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', lat: 31.4504, lng: 73.1350 },
  { id: 'quetta', name: 'Quetta', province: 'Balochistan', businessCount: 0, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', lat: 30.1798, lng: 66.9750 },
  { id: 'sialkot', name: 'Sialkot', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80', lat: 32.4945, lng: 74.5229 },
  { id: 'gujranwala', name: 'Gujranwala', province: 'Punjab', businessCount: 0, image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', lat: 32.1877, lng: 74.1945 },
];

/**
 * @deprecated Businesses are fetched live from Supabase
 * (supabaseDB.fetchBusinesses()). Always an empty array.
 */
export const INITIAL_BUSINESSES: Business[] = [];

/** @deprecated Same as INITIAL_BUSINESSES — always empty. */
export const MOCK_BUSINESSES: Business[] = [];

/** @deprecated Leads come from Supabase business_leads — always empty. */
export const MOCK_LEADS: LeadInquiry[] = [];

/** @deprecated Notifications come from Supabase — always empty. */
export const MOCK_NOTIFICATIONS: AppNotification[] = [];
