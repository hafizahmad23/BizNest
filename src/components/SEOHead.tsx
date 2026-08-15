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
    // Specific Business Profile SEO
    const bizCategory = business.category;
    const bizCity = business.city;
    pageTitle = `${business.name} - ${bizCategory} in ${bizCity}, Pakistan | BizNest Verified`;
    
    pageDesc = business.description
      ? `${business.name} is a top-rated ${bizCategory} in ${bizCity}, Pakistan. ${business.tagline || ''} Rating: ${business.rating}★ (${business.reviewCount} reviews). Contact: ${business.phone}.`.trim()
      : `${business.name} - Premier ${bizCategory} located in ${bizCity}, Pakistan. Find verified contact numbers, pricing, reviews, and services on BizNest.`;
    
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
    pageTitle = `Top ${category} Services in ${city}, Pakistan | BizNest Verified Listings`;
    pageDesc = `Discover and connect with top-rated ${category} in ${city}, Pakistan. Compare trust scores, response times, client reviews, and direct WhatsApp contact on BizNest.`;
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
    pageDesc = `Manage business listings in Pakistan, view customer lead inquiries, track trust scores, and write SEO descriptions with 1-Click Gemini AI.`;
  } else if (currentView === 'admin') {
    pageTitle = `Platform Admin Verification Portal | BizNest Pakistan`;
    pageDesc = `Admin management portal for approving, auditing, and verifying business listings across Pakistan.`;
  } else if (currentView === 'pricing') {
    pageTitle = `Merchant Subscription Plans & Verification Pricing | BizNest`;
    pageDesc = `Grow your Pakistani business with BizNest Merchant Premium. List across Pakistan, receive direct lead inquiries, and get verified badge status.`;
  }

  // Fallback defaults
  if (!pageTitle) {
    pageTitle = `BizNest Pakistan | Verified Business Directory & AI Ecosystem`;
  }
  if (!pageDesc) {
    pageDesc = `Pakistan's premier digital business discovery and ecosystem platform. Explore verified nurseries, restaurants, doctors, lawyers, and service providers across Lahore, Karachi, Islamabad, and beyond.`;
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
      'image': [business.coverImage, business.logoImage],
      'telephone': business.phone,
      'email': business.email,
      'priceRange': business.priceRange || '$$',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': business.city,
        'addressCountry': 'PK',
        'streetAddress': business.address
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': business.rating || 5.0,
        'reviewCount': business.reviewCount || 1,
        'bestRating': '5',
        'worstRating': '1'
      }
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
