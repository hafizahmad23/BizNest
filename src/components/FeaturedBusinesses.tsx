import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Filter, ShieldCheck, ArrowRight } from 'lucide-react';
import { Business, FilterState } from '../types';
import { BusinessCard } from './BusinessCard';

interface FeaturedBusinessesProps {
  businesses: Business[];
  onViewDetail: (biz: Business) => void;
  onToggleCompare: (biz: Business) => void;
  comparedIds: string[];
  filterState: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  isDarkMode: boolean;
}

export const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({
  businesses,
  onViewDetail,
  onToggleCompare,
  comparedIds,
  filterState,
  onFilterChange,
  isDarkMode
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const CATEGORY_TABS = [
    { label: 'All Listings', value: 'all' },
    { label: '🌿 Nursery', value: 'Nursery' },
    { label: '🍽 Restaurant', value: 'Restaurant' },
    { label: '👨⚕️ Doctor', value: 'Doctor' },
    { label: '🧰 Electrician', value: 'Electrician' },
    { label: '🏠 Real Estate', value: 'Real Estate' },
    { label: '👨💻 Freelancer', value: 'Freelancer' },
    { label: '🏨 Hotel', value: 'Hotel' }
  ];

  const filteredList = businesses.filter(b => {
    if (activeCategoryTab !== 'all' && b.category.toLowerCase() !== activeCategoryTab.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <section id="featured-businesses" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Handpicked Verified Network
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Featured Business Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified listings with live Trust Scores, instant WhatsApp connectivity, and fast response times.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
          <select
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className={`px-3 py-2 rounded-xl text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-[#0d1322] border border-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-900'
            }`}
          >
            <option value="trustScore">Highest Trust Score</option>
            <option value="popularityScore">Most Popular</option>
            <option value="rating">Top Rated (5 Stars)</option>
            <option value="newest">Recently Joined</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {CATEGORY_TABS.map((tab, idx) => {
          const isActive = activeCategoryTab.toLowerCase() === tab.value.toLowerCase();
          return (
            <button
              key={idx}
              onClick={() => setActiveCategoryTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : isDarkMode
                  ? 'bg-[#0e1628] text-slate-400 hover:text-white border border-slate-800/80'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Business Cards Grid */}
      {filteredList.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <p className="text-lg font-bold mb-2">No businesses found matching this filter.</p>
          <p className="text-xs text-slate-500 mb-4">Try clearing your search query or selecting a different city or category.</p>
          <button
            onClick={() => {
              setActiveCategoryTab('all');
              onFilterChange({ searchQuery: '', category: 'all', city: 'all', verifiedOnly: false });
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onViewDetail={onViewDetail}
              onToggleCompare={onToggleCompare}
              isCompared={comparedIds.includes(biz.id)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </section>
  );
};
