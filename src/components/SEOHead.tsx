import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Business } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'business.business' | 'article' | 'profile';
  business?: Business | null;
  category?: string;
  city?: string;
  currentView?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  business,
  category,
  city,
  currentView = 'home'
}) => {
  const siteName = 'BizNest Pakistan';
  const defaultDomain = typeof window !== 'undefined' ? window.location.origin : 'https://biznest.pk';

  // Build dynamic title based on view or business
  let pageTitle = title;
  let pageDesc = description;
  let pageKeywords = keywords || [];
  let pageImage = ogImage || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80';
  let pageUrl = canonicalUrl || defaultDomain;

  if (business) {
    // Specific Business Profile SEO — Task 11.2 format
    const bizCategory = business.category;
    const bizCity = business.city;
    pageTitle = `${business.name} — ${bizCategory} in ${bizCity} | BizNest Pakistan`;

    pageDesc = business.description
      ? `${business.name} is a ${bizCategory} in ${bizCity}, Pakistan. ${business.tagline || ''} ${business.reviewCount > 0 ? `Rating: ${business.rating.toFixed(1)}★ (${business.reviewCount} reviews).` : ''} Contact: ${business.phone}.`.trim()
      : `${business.name} — ${bizCategory} located in ${bizCity}, Pakistan. Find contact numbers, pricing, reviews, and services on BizNest.`;
    
    pageKeywords = [
      business.name,
      `${bizCategory} in ${bizCity}`,
      `best ${bizCategory} ${bizCity}`,
      `top ${bizCategory} Pakistan`,
      ...(business.aiKeywords || []),
      'verified Pakistani business',
      'BizNest directory'
    ];

    if (business.coverImage) {
      pageImage = business.coverImage;
    }

    pageUrl = `${defaultDomain}/?business=${business.id}`;
  } else if (category && category !== 'all' && city && city !== 'all') {
    // Combined Category + City filter SEO
    pageTitle = `Top ${category} Services in ${city}, Pakistan | BizNest Listings`;
    pageDesc = `Discover and connect with local ${category} in ${city}, Pakistan. Compare real customer reviews, ratings, and direct WhatsApp contact on BizNest.`;
    pageKeywords = [category, city, `${category} in ${city}`, `best ${category} ${city}`, 'Pakistan directory'];
    pageUrl = `${defaultDomain}/?category=${encodeURIComponent(category)}&city=${encodeURIComponent(city)}`;
  } else if (category && category !== 'all') {
    // Category filter SEO
    pageTitle = `Best ${category} in Pakistan | Verified Listings & AI Discovery - BizNest`;
    pageDesc = `Find verified ${category} across Lahore, Karachi, Islamabad, and all major cities in Pakistan. Get instant quotes, reviews, and trust verification on BizNest.`;
    pageKeywords = [category, `${category} Pakistan`, `top ${category}`, 'BizNest directory'];
    pageUrl = `${defaultDomain}/?category=${encodeURIComponent(category)}`;
  } else if (city && city !== 'all') {
    // City hub SEO
    pageTitle = `Verified Businesses in ${city}, Pakistan | BizNest Local Hub`;
    pageDesc = `Explore verified local businesses, service providers, nurseries, doctors, and real estate in ${city}, Pakistan. Connect directly on WhatsApp or phone.`;
    pageKeywords = [`businesses in ${city}`, `${city} local directory`, `top services ${city}`, `${city} market`];
    pageUrl = `${defaultDomain}/?city=${encodeURIComponent(city)}`;
  } else if (currentView === 'dashboard') {
    pageTitle = `Merchant Control Center & AI Assistant | BizNest Dashboard`;
    pageDesc = `Manage business listings in Pakistan, view customer lead inquiries, track real profile views, and write SEO descriptions with 1-click Gemini AI.`;
  } else if (currentView === 'admin') {
    pageTitle = `Platform Admin Verification Portal | BizNest Pakistan`;
    pageDesc = `Admin management portal for approving, auditing, and verifying business listings across Pakistan.`;
  } else if (currentView === 'pricing') {
    pageTitle = `Merchant Subscription Plans & Verification Pricing | BizNest`;
    pageDesc = `Grow your Pakistani business with BizNest Merchant Premium. List across Pakistan, receive direct lead inquiries, and get verified badge status.`;
  }

  // Fallback defaults — Task 11.1 exact strings
  if (!pageTitle) {
    pageTitle = 'BizNest Pakistan — Discover Local Businesses & Services Across Pakistan';
  }
  if (!pageDesc) {
    pageDesc = 'Find and review local businesses, shops, restaurants, and services across Pakistan.';
  }

  const defaultKeywordsList = [
    'BizNest Pakistan',
    'Pakistani business directory',
    'verified local businesses Lahore',
    'business directory Karachi',
    'Islamabad top services',
    'AI business matchmaker Pakistan',
    'Pakistan merchant platform',
    'WhatsApp business inquiry'
  ];

  const finalKeywords = Array.from(new Set([...pageKeywords, ...defaultKeywordsList])).join(', ');

  // Schema.org Structured Data (JSON-LD)
  let jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'BizNest Pakistan',
    'url': defaultDomain,
    'description': 'Pakistan premier verified local business directory & AI ecosystem platform',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${defaultDomain}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  if (business) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': business.name,
      'description': business.description || business.tagline,
      'image': [business.coverImage, business.logoImage].filter(Boolean),
      'telephone': business.phone,
      'email': business.email,
      'priceRange': business.priceRange || '$$',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': business.city,
        'addressCountry': 'PK',
        'streetAddress': business.address
      },
      // Only publish structured ratings when REAL reviews exist
      ...(business.reviewCount > 0
        ? {
            'aggregateRating': {
              '@type': 'AggregateRating',
              'ratingValue': business.rating,
              'reviewCount': business.reviewCount,
              'bestRating': '5',
              'worstRating': '1'
            }
          }
        : {})
    };
  }

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="BizNest Pakistan" />
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content={city && city !== 'all' ? city : 'Pakistan'} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:type" content={business ? 'business.business' : ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:locale" content="en_PK" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {/* Schema.org JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
