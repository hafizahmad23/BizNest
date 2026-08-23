import React, { useState } from 'react';
import { AlertTriangle, Loader2, PlusCircle, RotateCcw, SearchX } from 'lucide-react';
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
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onListBusiness?: () => void;
}

const CATEGORY_TABS = [
  { label: 'All Listings', value: 'all' },
  { label: '🌿 Nursery', value: 'Botanical & Nursery' },
  { label: '🍽 Restaurants', value: 'Restaurants & Cafes' },
  { label: '👨‍⚕️ Doctors', value: 'Doctors & Clinics' },
  { label: '🧰 Electricians', value: 'Electricians & Solar' },
  { label: '🏠 Real Estate', value: 'Real Estate & Plots' },
  { label: '👨‍💻 Software', value: 'Software & Freelancers' },
  { label: '🏨 Hotels', value: 'Hotels & Guest Houses' }
];

export const FeaturedBusinesses: React.FC<FeaturedBusinessesProps> = ({
  businesses,
  onViewDetail,
  onToggleCompare,
  comparedIds,
  filterState,
  onFilterChange,
  isDarkMode,
  isLoading = false,
  error = null,
  onRetry,
  onClearFilters,
  onListBusiness
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const filteredList = businesses.filter((b) => {
    if (activeCategoryTab !== 'all' && b.category.toLowerCase() !== activeCategoryTab.toLowerCase()) {
      return false;
    }
    return true;
  });

  const hasActiveSearch =
    Boolean(filterState.searchQuery) ||
    filterState.category !== 'all' ||
    filterState.city !== 'all' ||
    filterState.verifiedOnly ||
    activeCategoryTab !== 'all';

  const clearAll = () => {
    setActiveCategoryTab('all');
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFilterChange({ searchQuery: '', category: 'all', city: 'all', verifiedOnly: false });
    }
  };

  return (
    <section id="featured-businesses" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Live Directory
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Business Listings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse real, database-backed listings with instant WhatsApp connectivity across Pakistan.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Sort By:</span>
          <select
            value={filterState.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className={`px-3 py-2 rounded-xl text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-[#0d1322] border border-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-900'
            }`}
          >
            <option value="newest">Recently Joined</option>
            <option value="rating">Top Rated</option>
            <option value="mostViewed">Most Viewed</option>
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

      {/* Loading state */}
      {isLoading && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-500" />
          <p className="text-sm font-bold">Loading live business listings…</p>
        </div>
      )}

      {/* Error state with retry — NEVER fake fallback data */}
      {!isLoading && error && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-[#0d1322] border-rose-500/30 text-slate-300' : 'bg-rose-50 border-rose-200 text-slate-700'
        }`}>
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
          <p className="text-lg font-bold mb-1">Could not load businesses</p>
          <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !error && filteredList.length === 0 && (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          {hasActiveSearch ? (
            <>
              <SearchX className="w-10 h-10 mx-auto mb-3 text-slate-500" />
              <p className="text-lg font-bold mb-2">
                {filterState.searchQuery
                  ? `No results found for "${filterState.searchQuery}". Try a different search.`
                  : 'No businesses found matching these filters.'}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Try clearing your search query or selecting a different city or category.
              </p>
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-bold mb-2">
                No businesses listed yet. Be the first to join BizNest Pakistan!
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Create your free listing and appear here for customers across Pakistan.
              </p>
              {onListBusiness && (
                <button
                  onClick={onListBusiness}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  List Your Business
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Business Cards Grid */}
      {!isLoading && !error && filteredList.length > 0 && (
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
