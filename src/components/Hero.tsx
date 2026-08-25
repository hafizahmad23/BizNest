import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Sparkles, ShieldCheck, ArrowRight, X, Clock, Trash2, 
  History, Tag, Globe, ChevronDown 
} from 'lucide-react';
import { PAKISTAN_CITIES, POPULAR_CATEGORIES } from '../data/mockData';
import { CascadingLocationSelector, LocationSelectionValue } from './CascadingLocationSelector';

export interface RecentSearchItem {
  id: string;
  query: string;
  category: string;
  city: string;
  timestamp: string;
}

interface HeroProps {
  onSearch?: (query: string, category: string, city: string, verifiedOnly: boolean) => void;
  onOpenAiMatchmaker?: () => void;
  onSelectCategory?: (category: string) => void;
  isDarkMode?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onSearch,
  onOpenAiMatchmaker,
  onSelectCategory,
  isDarkMode = true
}) => {
  const triggerSearch = (q: string, cat: string, c: string, v: boolean) => {
    if (onSearch) onSearch(q, cat, c, v);
  };

  const triggerMatchmaker = () => {
    if (onOpenAiMatchmaker) onOpenAiMatchmaker();
  };

  const triggerCategorySelect = (category: string) => {
    if (onSelectCategory) onSelectCategory(category);
  };

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCascadingSelector, setShowCascadingSelector] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  // Stable-identity location handler for the cascading selector (an inline
  // arrow here would give the selector's memoized callbacks a new identity on
  // every render).
  const handleCascadingLocationChange = useCallback(
    (loc: LocationSelectionValue) => {
      const targetName = loc.cityOrVillageName !== 'All Areas'
          ? loc.cityOrVillageName
          : (loc.tehsilName !== 'All Tehsils'
            ? loc.tehsilName
            : (loc.districtName !== 'All Districts'
              ? loc.districtName
              : (loc.provinceName !== 'All Pakistan' ? loc.provinceName : 'all')));
      setCity(targetName);
      if (onSearch) onSearch(query, category, targetName, verifiedOnly);
    },
    [onSearch, query, category, verifiedOnly]
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from LocalStorage (the user's OWN history only —
  // no fabricated default searches are injected)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('biznest_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }, []);

  // Handle outside click to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save recent search
  const saveRecentSearch = (searchQuery: string, searchCat: string, searchCity: string) => {
    const qClean = searchQuery.trim();
    if (!qClean && searchCat === 'all' && searchCity === 'all') return;

    const newItem: RecentSearchItem = {
      id: `rs-${Date.now()}`,
      query: qClean,
      category: searchCat,
      city: searchCity,
      timestamp: 'Just now'
    };

    setRecentSearches(prev => {
      const filtered = prev.filter(item => !(
        item.query.toLowerCase() === qClean.toLowerCase() &&
        item.category.toLowerCase() === searchCat.toLowerCase() &&
        item.city.toLowerCase() === searchCity.toLowerCase()
      ));
      const updated = [newItem, ...filtered].slice(0, 7);
      try {
        localStorage.setItem('biznest_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches:', e);
      }
      return updated;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecentSearch(query, category, city);
    setShowSuggestions(false);
    triggerSearch(query, category, city, verifiedOnly);
  };

  const handleSelectRecentSearch = (item: RecentSearchItem) => {
    setQuery(item.query);
    setCategory(item.category || 'all');
    setCity(item.city || 'all');
    setShowSuggestions(false);
    triggerSearch(item.query, item.category || 'all', item.city || 'all', verifiedOnly);
    saveRecentSearch(item.query, item.category || 'all', item.city || 'all');
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('biznest_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update recent searches:', e);
      }
      return updated;
    });
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('biznest_recent_searches');
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  };

  const QUICK_TAGS = [
    { label: '🌿 Nursery', value: 'Botanical & Nursery' },
    { label: '🍽 Restaurants', value: 'Restaurants & Cafes' },
    { label: '👨‍⚕️ Doctors', value: 'Doctors & Clinics' },
    { label: '🧰 Electricians', value: 'Electricians & Solar' },
    { label: '🏠 Real Estate', value: 'Real Estate & Plots' },
    { label: '👨‍💻 Software', value: 'Software & Freelancers' }
  ];

  return (
    <section className="relative overflow-visible pt-10 pb-16 px-4 sm:px-8">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/50 via-sky-50/40 to-transparent dark:from-indigo-950/20 dark:via-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        
        {/* Badge */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Pakistan’s Growing Business Directory</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900 dark:text-white"
        >
          Discover. Connect.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
            Grow.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-10 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Everything Your Business Needs, In One Place. Search local nurseries, restaurants, doctors, lawyers, freelancers & real estate partners across Pakistan.
        </motion.p>

        {/* Search Container Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-4xl mx-auto mb-8 z-40"
          ref={searchContainerRef}
        >
          {/* Main Search Form Wrapper */}
          <div className="relative z-50">
            <form
              onSubmit={handleSearchSubmit}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-900/95 border-slate-800 shadow-xl backdrop-blur-xl'
                  : 'bg-white border-slate-200/90 shadow-xl shadow-slate-200/60 backdrop-blur-xl'
              } flex flex-col md:flex-row items-center gap-2`}
            >
              {/* Search Input */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search a business, category, or city — e.g. 'Plumber in Lahore'..."
                  className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition ${
                    isDarkMode
                      ? 'bg-slate-950/80 text-white placeholder-slate-500 border border-slate-800 focus:border-emerald-500/50'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-emerald-500/50'
                  }`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="w-full md:w-48">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl text-xs font-semibold appearance-none cursor-pointer focus:outline-none transition ${
                    isDarkMode
                      ? 'bg-slate-950/80 text-slate-200 border border-slate-800'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {POPULAR_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="w-full md:w-44">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl text-xs font-semibold appearance-none cursor-pointer focus:outline-none transition ${
                    isDarkMode
                      ? 'bg-slate-950/80 text-slate-200 border border-slate-800'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  <option value="all">All Pakistan</option>
                  {PAKISTAN_CITIES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Search CTA */}
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Instant Search Suggestions & Recent Searches Popover */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.99 }}
                  className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-[100] text-left overflow-hidden max-h-96 overflow-y-auto ${
                    isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {/* SECTION 1: Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          onClick={handleClearAllRecentSearches}
                          className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer font-semibold"
                          title="Clear recent searches"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear all</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        {recentSearches.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectRecentSearch(item)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                              isDarkMode
                                ? 'hover:bg-slate-900/80 text-slate-200 hover:text-white'
                                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <History className="w-3.5 h-3.5 text-emerald-500 shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="font-semibold truncate">
                                  {item.query ? `"${item.query}"` : 'All Categories'}
                                </span>
                                {item.category && item.category !== 'all' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                    {item.category}
                                  </span>
                                )}
                                {item.city && item.city !== 'all' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                                    {item.city}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.timestamp}
                              </span>
                              <button
                                onClick={(e) => handleRemoveRecentSearch(e, item.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                                title="Remove from history"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: Query Matching Suggestions */}
                  {query.trim().length > 0 && (
                    <div className="p-3">
                      <div className="text-[11px] font-bold uppercase text-slate-400 px-1 py-1 tracking-wider mb-1">
                        Matching Categories & Cities
                      </div>
                      <div className="flex flex-col gap-1">
                        {POPULAR_CATEGORIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCategory(cat.name);
                              setShowSuggestions(false);
                              saveRecentSearch(query, cat.name, city);
                              triggerSearch(query, cat.name, city, verifiedOnly);
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-500/10 hover:text-emerald-400 transition cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Category: <strong>{cat.name}</strong></span>
                            </span>
                          </button>
                        ))}
                        {PAKISTAN_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCity(c.name);
                              setShowSuggestions(false);
                              saveRecentSearch(query, category, c.name);
                              triggerSearch(query, category, c.name, verifiedOnly);
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-cyan-500/10 hover:text-cyan-400 transition cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                              <span>City: <strong>{c.name}</strong></span>
                            </span>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            saveRecentSearch(query, category, city);
                            setShowSuggestions(false);
                            triggerSearch(query, category, city, verifiedOnly);
                          }}
                          className="mt-1 w-full text-center py-2 text-xs text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          View all results for "{query}" →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SECTION 3: Empty query & no recent searches fallback */}
                  {query.trim().length === 0 && recentSearches.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <p className="font-semibold text-slate-300 mb-1">Start discovering businesses across Pakistan</p>
                      <p className="text-[11px] text-slate-500">Type a business name, city, or category above to explore.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cascading Location Toggle Sub-Bar */}
          <div className="mt-3 flex items-center justify-between px-2 text-xs relative z-30">
            <button
              type="button"
              onClick={() => setShowCascadingSelector(!showCascadingSelector)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {showCascadingSelector ? 'Hide Location Selector' : '🗺️ Cascading Location Filter (Province → District → Tehsil → Village)'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCascadingSelector ? 'rotate-180' : ''}`} />
            </button>

            {city !== 'all' && (
              <span className="text-[11px] text-cyan-400 font-medium">
                Active location: <strong>{city}</strong>
              </span>
            )}
          </div>

          {/* Cascading Location Drawer */}
          <AnimatePresence>
            {showCascadingSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-left relative z-30"
              >
                <CascadingLocationSelector
                  isDarkMode={isDarkMode}
                  showMapVerification={true}
                  onLocationChange={handleCascadingLocationChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filter Badges & Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
        >
          <button
            onClick={() => {
              setVerifiedOnly(!verifiedOnly);
              triggerSearch(query, category, city, !verifiedOnly);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer ${
              verifiedOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                : isDarkMode ? 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Businesses Only</span>
          </button>

          <span className="text-slate-600 text-xs hidden sm:inline">•</span>

          <span className="text-xs text-slate-400 font-medium">Popular:</span>
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => triggerCategorySelect(tag.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </motion.div>

        {/* Secondary Action: AI Matchmaker Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={triggerMatchmaker}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 border-purple-500/30 text-purple-300 hover:border-purple-400'
                : 'bg-white border-purple-200 text-purple-800 hover:bg-purple-50/50 hover:border-purple-300 shadow-slate-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Try AI Smart Matchmaker ("Find me a nursery in Lahore DHA...")</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};