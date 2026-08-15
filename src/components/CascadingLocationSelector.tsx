import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, ChevronDown, Check, Globe, Building2, Search, RotateCcw, 
  Map as MapIcon, Compass, Navigation2, Crosshair, X, Info
} from 'lucide-react';
import { 
  PAKISTAN_LOCATION_DB, 
  getAllProvinces, 
  getDistrictsByProvince, 
  getTehsilsByDistrict, 
  getCitiesOrVillagesByTehsil,
  searchAllPakistanLocations,
  getCoordinatesForLocation,
  FlatLocationResult
} from '../data/pakistanLocations';
import { GoogleLocationMap } from './GoogleLocationMap';

export interface LocationSelectionValue {
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  tehsilId: string;
  tehsilName: string;
  cityOrVillageId: string;
  cityOrVillageName: string;
  lat: number;
  lng: number;
}

interface CascadingLocationSelectorProps {
  onLocationChange?: (value: LocationSelectionValue) => void;
  initialProvinceId?: string;
  initialDistrictId?: string;
  initialTehsilId?: string;
  initialCityOrVillageName?: string;
  isDarkMode?: boolean;
  compact?: boolean;
  showMapVerification?: boolean;
}

export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  onLocationChange,
  initialProvinceId = 'all',
  initialDistrictId = 'all',
  initialTehsilId = 'all',
  initialCityOrVillageName = 'all',
  isDarkMode = true,
  compact = false,
  showMapVerification = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Selection states
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId);
  const [selectedTehsilId, setSelectedTehsilId] = useState<string>(initialTehsilId);
  const [selectedCityOrVillageName, setSelectedCityOrVillageName] = useState<string>(initialCityOrVillageName);

  // Search input for quick location jumping
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showGlobalSearchResults, setShowGlobalSearchResults] = useState(false);

  // Map toggle
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'province' | 'district' | 'tehsil' | 'city' | null>(null);

  // Local search queries for each dropdown filter
  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [tehsilSearch, setTehsilSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowGlobalSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Provinces list
  const provinces = useMemo(() => getAllProvinces(), []);

  // 2. Districts list based on selected province
  const districts = useMemo(() => {
    if (selectedProvinceId === 'all') return [];
    return getDistrictsByProvince(selectedProvinceId);
  }, [selectedProvinceId]);

  // 3. Tehsils list based on selected district
  const tehsils = useMemo(() => {
    if (selectedProvinceId === 'all' || selectedDistrictId === 'all') return [];
    return getTehsilsByDistrict(selectedProvinceId, selectedDistrictId);
  }, [selectedProvinceId, selectedDistrictId]);

  // 4. Cities / Villages list based on selected tehsil
  const citiesOrVillages = useMemo(() => {
    if (selectedProvinceId === 'all' || selectedDistrictId === 'all' || selectedTehsilId === 'all') return [];
    return getCitiesOrVillagesByTehsil(selectedProvinceId, selectedDistrictId, selectedTehsilId);
  }, [selectedProvinceId, selectedDistrictId, selectedTehsilId]);

  // Global search matching results across entire Pakistan DB
  const globalSearchResults = useMemo(() => {
    return searchAllPakistanLocations(globalSearchQuery, 12);
  }, [globalSearchQuery]);

  // Names lookup
  const selectedProvinceName = useMemo(() => {
    if (selectedProvinceId === 'all') return 'All Pakistan';
    const p = PAKISTAN_LOCATION_DB.find(prov => prov.id === selectedProvinceId);
    return p ? p.name : 'All Pakistan';
  }, [selectedProvinceId]);

  const selectedDistrictName = useMemo(() => {
    if (selectedDistrictId === 'all') return 'All Districts';
    const d = districts.find(dist => dist.id === selectedDistrictId);
    return d ? d.name : 'All Districts';
  }, [selectedDistrictId, districts]);

  const selectedTehsilName = useMemo(() => {
    if (selectedTehsilId === 'all') return 'All Tehsils';
    const t = tehsils.find(teh => teh.id === selectedTehsilId);
    return t ? t.name : 'All Tehsils';
  }, [selectedTehsilId, tehsils]);

  // Current Coordinates
  const currentCoords = useMemo(() => {
    return getCoordinatesForLocation(
      selectedCityOrVillageName !== 'all' ? selectedCityOrVillageName : (selectedDistrictName !== 'All Districts' ? selectedDistrictName : selectedProvinceName),
      selectedDistrictName !== 'All Districts' ? selectedDistrictName : undefined
    );
  }, [selectedCityOrVillageName, selectedDistrictName, selectedProvinceName]);

  // Trigger callback when values change
  const notifyChange = (
    provId: string, 
    distId: string, 
    tehId: string, 
    cityName: string
  ) => {
    if (!onLocationChange) return;

    const pName = provId === 'all' ? 'All Pakistan' : (PAKISTAN_LOCATION_DB.find(p => p.id === provId)?.name || 'All Pakistan');
    const dObj = getDistrictsByProvince(provId).find(d => d.id === distId);
    const dName = distId === 'all' ? 'All Districts' : (dObj?.name || 'All Districts');
    const tObj = dObj ? dObj.tehsils.find(t => t.id === tehId) : undefined;
    const tName = tehId === 'all' ? 'All Tehsils' : (tObj?.name || 'All Tehsils');

    const coords = getCoordinatesForLocation(
      cityName !== 'all' ? cityName : (dName !== 'All Districts' ? dName : pName),
      dName !== 'All Districts' ? dName : undefined
    );

    onLocationChange({
      provinceId: provId,
      provinceName: pName,
      districtId: distId,
      districtName: dName,
      tehsilId: tehId,
      tehsilName: tName,
      cityOrVillageId: cityName,
      cityOrVillageName: cityName === 'all' ? 'All Areas' : cityName,
      lat: coords.lat,
      lng: coords.lng
    });
  };

  // Handlers for cascading selects
  const handleSelectProvince = (provId: string) => {
    setSelectedProvinceId(provId);
    setSelectedDistrictId('all');
    setSelectedTehsilId('all');
    setSelectedCityOrVillageName('all');
    setOpenDropdown(null);
    notifyChange(provId, 'all', 'all', 'all');
  };

  const handleSelectDistrict = (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedTehsilId('all');
    setSelectedCityOrVillageName('all');
    setOpenDropdown(null);
    notifyChange(selectedProvinceId, distId, 'all', 'all');
  };

  const handleSelectTehsil = (tehId: string) => {
    setSelectedTehsilId(tehId);
    setSelectedCityOrVillageName('all');
    setOpenDropdown(null);
    notifyChange(selectedProvinceId, selectedDistrictId, tehId, 'all');
  };

  const handleSelectCityOrVillage = (cityName: string) => {
    setSelectedCityOrVillageName(cityName);
    setOpenDropdown(null);
    notifyChange(selectedProvinceId, selectedDistrictId, selectedTehsilId, cityName);
  };

  const handleResetAll = () => {
    setSelectedProvinceId('all');
    setSelectedDistrictId('all');
    setSelectedTehsilId('all');
    setSelectedCityOrVillageName('all');
    setGlobalSearchQuery('');
    setOpenDropdown(null);
    notifyChange('all', 'all', 'all', 'all');
  };

  const handleSelectGlobalSearchResult = (item: FlatLocationResult) => {
    const prov = PAKISTAN_LOCATION_DB.find(p => p.name.toLowerCase() === item.provinceName.toLowerCase());
    if (prov) {
      setSelectedProvinceId(prov.id);
      const dist = prov.districts.find(d => d.name.toLowerCase() === item.districtName.toLowerCase());
      if (dist) {
        setSelectedDistrictId(dist.id);
        const teh = dist.tehsils.find(t => t.name.toLowerCase() === item.tehsilName.toLowerCase());
        if (teh) {
          setSelectedTehsilId(teh.id);
          setSelectedCityOrVillageName(item.cityName);
          notifyChange(prov.id, dist.id, teh.id, item.cityName);
        }
      }
    }
    setGlobalSearchQuery('');
    setShowGlobalSearchResults(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full text-left transition-all rounded-3xl border p-4 sm:p-5 relative ${
        isDarkMode 
          ? 'bg-[#091122]/95 border-slate-800 shadow-2xl backdrop-blur-xl text-white' 
          : 'bg-white/95 border-slate-200 shadow-xl backdrop-blur-xl text-slate-900'
      }`}
    >
      {/* 1. Header Bar & Quick Jump Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                Pakistan Location Selector
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                Complete GPS DB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Province → District → Tehsil → City / Village / Sector
            </p>
          </div>
        </div>

        {/* Global Quick Search Input */}
        <div className="relative flex-1 max-w-md z-[90]">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs transition ${
            isDarkMode ? 'bg-slate-900/90 border-slate-700/80 focus-within:border-emerald-500' : 'bg-slate-100 border-slate-300 focus-within:border-emerald-500'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setShowGlobalSearchResults(true);
              }}
              onFocus={() => setShowGlobalSearchResults(true)}
              placeholder="Quick search: type village, sector, tehsil or city..."
              className="bg-transparent outline-none w-full text-xs font-medium placeholder-slate-400"
            />
            {globalSearchQuery && (
              <button 
                onClick={() => setGlobalSearchQuery('')} 
                className="text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Popover */}
          <AnimatePresence>
            {showGlobalSearchResults && globalSearchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-[100] overflow-hidden max-h-72 overflow-y-auto ${
                  isDarkMode ? 'bg-[#0b1329] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase text-slate-400 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center sticky top-0 backdrop-blur-md">
                  <span>Matching Locations in Pakistan ({globalSearchResults.length})</span>
                  <button onClick={() => setShowGlobalSearchResults(false)} className="hover:text-rose-400 text-xs font-semibold">Close</button>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {globalSearchResults.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectGlobalSearchResult(res)}
                      className="px-3 py-2.5 text-xs hover:bg-emerald-500/10 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-emerald-400">{res.cityName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({res.tehsilName}, {res.districtName})
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 capitalize font-medium shrink-0 ml-2">
                        {res.provinceName}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Breadcrumb Badge Indicator */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs font-medium">
        <span className="flex items-center gap-1 text-slate-400 font-semibold px-2 py-1 rounded-lg bg-slate-800/50">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pakistan</span>
        </span>

        <span className="text-slate-600">/</span>

        <span className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
          selectedProvinceId !== 'all' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
        }`}>
          <span>{selectedProvinceName}</span>
        </span>

        {selectedDistrictId !== 'all' && (
          <>
            <span className="text-slate-600">/</span>
            <span className="px-2.5 py-1 rounded-lg font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {selectedDistrictName}
            </span>
          </>
        )}

        {selectedTehsilId !== 'all' && (
          <>
            <span className="text-slate-600">/</span>
            <span className="px-2.5 py-1 rounded-lg font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {selectedTehsilName}
            </span>
          </>
        )}

        {selectedCityOrVillageName !== 'all' && (
          <>
            <span className="text-slate-600">/</span>
            <span className="px-2.5 py-1 rounded-lg font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {selectedCityOrVillageName}
            </span>
          </>
        )}

        {(selectedProvinceId !== 'all' || globalSearchQuery) && (
          <button
            onClick={handleResetAll}
            className="ml-auto px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 3. Four Cascading Dropdown Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* STEP 1: PROVINCE SELECTOR */}
        <div className={`relative ${openDropdown === 'province' ? 'z-[80]' : 'z-10'}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>1. Province / Region</span>
            <span className="text-[10px] text-emerald-400 font-bold">{provinces.length} Available</span>
          </label>
          
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'province' ? null : 'province')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedProvinceId !== 'all'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm'
                : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800')
            }`}
          >
            <span className="truncate flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{selectedProvinceName}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${openDropdown === 'province' ? 'rotate-180' : ''}`} />
          </button>

          {/* Province Dropdown Menu */}
          <AnimatePresence>
            {openDropdown === 'province' && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-[90] p-2 overflow-hidden ${
                  isDarkMode ? 'bg-[#0b1329] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    placeholder="Filter province..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectProvince('all')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-500/10 rounded-lg flex items-center justify-between font-bold text-emerald-400 cursor-pointer"
                  >
                    <span>🇵🇰 Whole Pakistan</span>
                    {selectedProvinceId === 'all' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  {provinces
                    .filter(p => p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
                    .map(prov => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => handleSelectProvince(prov.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-500/10 rounded-lg flex items-center justify-between transition cursor-pointer ${
                          selectedProvinceId === prov.id ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">{prov.code}</span>
                          <span>{prov.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{prov.districtCount} Dist</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 2: DISTRICT SELECTOR */}
        <div className={`relative ${openDropdown === 'district' ? 'z-[80]' : 'z-10'}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>2. District</span>
            <span className="text-[10px] text-cyan-400 font-bold">{districts.length} Options</span>
          </label>
          
          <button
            type="button"
            disabled={selectedProvinceId === 'all'}
            onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedProvinceId === 'all'
                ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800 text-slate-500'
                : selectedDistrictId !== 'all'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-sm'
                : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800')
            }`}
          >
            <span className="truncate flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{selectedDistrictName}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${openDropdown === 'district' ? 'rotate-180' : ''}`} />
          </button>

          {/* District Dropdown Menu */}
          <AnimatePresence>
            {openDropdown === 'district' && selectedProvinceId !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-[90] p-2 overflow-hidden ${
                  isDarkMode ? 'bg-[#0b1329] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder="Filter district..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectDistrict('all')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-500/10 rounded-lg flex items-center justify-between font-bold text-cyan-400 cursor-pointer"
                  >
                    <span>All Districts in {selectedProvinceName}</span>
                    {selectedDistrictId === 'all' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                  {districts
                    .filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
                    .map(dist => (
                      <button
                        key={dist.id}
                        type="button"
                        onClick={() => handleSelectDistrict(dist.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-cyan-500/10 rounded-lg flex items-center justify-between transition cursor-pointer ${
                          selectedDistrictId === dist.id ? 'bg-cyan-500/15 text-cyan-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span>{dist.name} District</span>
                        <span className="text-[10px] text-slate-400 font-medium">{dist.tehsils.length} Tehsils</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 3: TEHSIL SELECTOR */}
        <div className={`relative ${openDropdown === 'tehsil' ? 'z-[80]' : 'z-10'}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>3. Tehsil</span>
            <span className="text-[10px] text-amber-400 font-bold">{tehsils.length} Options</span>
          </label>
          
          <button
            type="button"
            disabled={selectedDistrictId === 'all'}
            onClick={() => setOpenDropdown(openDropdown === 'tehsil' ? null : 'tehsil')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedDistrictId === 'all'
                ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800 text-slate-500'
                : selectedTehsilId !== 'all'
                ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-sm'
                : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800')
            }`}
          >
            <span className="truncate flex items-center gap-2">
              <Navigation2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{selectedTehsilName}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${openDropdown === 'tehsil' ? 'rotate-180' : ''}`} />
          </button>

          {/* Tehsil Dropdown Menu */}
          <AnimatePresence>
            {openDropdown === 'tehsil' && selectedDistrictId !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-[90] p-2 overflow-hidden ${
                  isDarkMode ? 'bg-[#0b1329] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={tehsilSearch}
                    onChange={(e) => setTehsilSearch(e.target.value)}
                    placeholder="Filter tehsil..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectTehsil('all')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-amber-500/10 rounded-lg flex items-center justify-between font-bold text-amber-400 cursor-pointer"
                  >
                    <span>All Tehsils in {selectedDistrictName}</span>
                    {selectedTehsilId === 'all' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  {tehsils
                    .filter(t => t.name.toLowerCase().includes(tehsilSearch.toLowerCase()))
                    .map(teh => (
                      <button
                        key={teh.id}
                        type="button"
                        onClick={() => handleSelectTehsil(teh.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-amber-500/10 rounded-lg flex items-center justify-between transition cursor-pointer ${
                          selectedTehsilId === teh.id ? 'bg-amber-500/15 text-amber-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span>{teh.name} Tehsil</span>
                        <span className="text-[10px] text-slate-400 font-medium">{teh.citiesOrVillages.length} Areas</span>
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 4: CITY / VILLAGE / LOCALITY SELECTOR */}
        <div className={`relative ${openDropdown === 'city' ? 'z-[80]' : 'z-10'}`}>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>4. City / Village / Area</span>
            <span className="text-[10px] text-purple-400 font-bold">{citiesOrVillages.length} Options</span>
          </label>
          
          <button
            type="button"
            disabled={selectedTehsilId === 'all'}
            onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedTehsilId === 'all'
                ? 'opacity-50 cursor-not-allowed bg-slate-900/40 border-slate-800 text-slate-500'
                : selectedCityOrVillageName !== 'all'
                ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-sm'
                : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700' : 'bg-slate-100 border-slate-300 text-slate-800')
            }`}
          >
            <span className="truncate flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{selectedCityOrVillageName === 'all' ? 'All Areas' : selectedCityOrVillageName}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${openDropdown === 'city' ? 'rotate-180' : ''}`} />
          </button>

          {/* City/Village Dropdown Menu */}
          <AnimatePresence>
            {openDropdown === 'city' && selectedTehsilId !== 'all' && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl border shadow-2xl z-[90] p-2 overflow-hidden ${
                  isDarkMode ? 'bg-[#0b1329] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Filter area or village..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/50 pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCityOrVillage('all')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-500/10 rounded-lg flex items-center justify-between font-bold text-purple-400 cursor-pointer"
                  >
                    <span>All Areas in {selectedTehsilName}</span>
                    {selectedCityOrVillageName === 'all' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                  {citiesOrVillages
                    .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                    .map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectCityOrVillage(item.name)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-purple-500/10 rounded-lg flex items-center justify-between transition cursor-pointer ${
                          selectedCityOrVillageName === item.name ? 'bg-purple-500/15 text-purple-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.type === 'village' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {item.type}
                          </span>
                          <span>{item.name}</span>
                        </span>
                        {item.businessCount && (
                          <span className="text-[10px] text-slate-400 font-medium">{item.businessCount} Biz</span>
                        )}
                      </button>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Interactive Google Map Verification Toggle */}
      {showMapVerification && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              GPS Center: <strong className="text-slate-200 font-mono">{currentCoords.lat.toFixed(4)}°N, {currentCoords.lng.toFixed(4)}°E</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMapVisible(!isMapVisible)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <MapIcon className="w-4 h-4" />
            <span>{isMapVisible ? 'Hide Interactive Map' : 'Verify Location on Google Map 🗺️'}</span>
          </button>
        </div>
      )}

      {/* Embedded Google Map Component */}
      <AnimatePresence>
        {isMapVisible && showMapVerification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <GoogleLocationMap
              lat={currentCoords.lat}
              lng={currentCoords.lng}
              locationName={selectedCityOrVillageName !== 'all' ? selectedCityOrVillageName : selectedDistrictName}
              province={selectedProvinceName}
              district={selectedDistrictName}
              tehsil={selectedTehsilName}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
