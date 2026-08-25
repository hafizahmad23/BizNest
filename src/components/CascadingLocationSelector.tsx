import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, ChevronDown, Check, Globe, Search, RotateCcw,
  Map as MapIcon, X, AlertTriangle, Loader2
} from 'lucide-react';
import { GoogleLocationMap } from './GoogleLocationMap';
import {
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchCitiesByDistrict,
  searchCities,
} from '../lib/supabaseDB';
import { ProvinceRow, DistrictRow, CityRow } from '../types';

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
  initialCityOrVillageName?: string;
  isDarkMode?: boolean;
  compact?: boolean;
  showMapVerification?: boolean;
}

const DEFAULT_COORDS = { lat: 33.6844, lng: 73.0479 }; // Islamabad

/**
 * Province → District → City cascading selector backed 100% by the Supabase
 * location tables (provinces, districts, cities). Includes searchable
 * dropdowns, a global city search, error states with retry (never fake
 * fallback data), and an optional map verification for the selected city.
 */
export const CascadingLocationSelector: React.FC<CascadingLocationSelectorProps> = ({
  onLocationChange,
  initialProvinceId = 'all',
  initialDistrictId = 'all',
  isDarkMode = true,
  compact = false,
  showMapVerification = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [provinces, setProvinces] = useState<ProvinceRow[]>([]);
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);

  const [loadingLevel, setLoadingLevel] = useState<'province' | 'district' | 'city' | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialProvinceId);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId);
  const [selectedCityId, setSelectedCityId] = useState<string>('all');

  const [openDropdown, setOpenDropdown] = useState<'province' | 'district' | 'city' | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<(CityRow & { districtName?: string; provinceName?: string })[]>([]);
  const [globalSearching, setGlobalSearching] = useState(false);
  const [showGlobalResults, setShowGlobalResults] = useState(false);

  const [isMapVisible, setIsMapVisible] = useState(false);

  // -------------------------- DATA LOADING ---------------------------------

  const loadProvinces = useCallback(async () => {
    setLoadingLevel('province');
    setLoadError(null);
    const { data, error } = await fetchProvinces();
    if (error) {
      setLoadError(error);
      setProvinces([]);
    } else {
      setProvinces(data || []);
    }
    setLoadingLevel(null);
  }, []);

  const loadDistricts = useCallback(async (provinceId: string) => {
    setLoadingLevel('district');
    setLoadError(null);
    const { data, error } = await fetchDistrictsByProvince(provinceId);
    if (error) {
      setLoadError(error);
      setDistricts([]);
    } else {
      setDistricts(data || []);
    }
    setLoadingLevel(null);
  }, []);

  const loadCities = useCallback(async (districtId: string) => {
    setLoadingLevel('city');
    setLoadError(null);
    const { data, error } = await fetchCitiesByDistrict(districtId);
    if (error) {
      setLoadError(error);
      setCities([]);
    } else {
      setCities(data || []);
    }
    setLoadingLevel(null);
  }, []);

  useEffect(() => {
    void loadProvinces();
  }, [loadProvinces]);

  useEffect(() => {
    setSelectedDistrictId('all');
    setSelectedCityId('all');
    setCities([]);
    if (selectedProvinceId !== 'all') {
      void loadDistricts(selectedProvinceId);
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceId, loadDistricts]);

  useEffect(() => {
    setSelectedCityId('all');
    if (selectedDistrictId !== 'all') {
      void loadCities(selectedDistrictId);
    } else {
      setCities([]);
    }
  }, [selectedDistrictId, loadCities]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowGlobalResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global city search (debounced)
  useEffect(() => {
    if (globalQuery.trim().length < 2) {
      setGlobalResults([]);
      return;
    }
    setGlobalSearching(true);
    const t = setTimeout(async () => {
      const { data } = await searchCities(globalQuery.trim());
      const citiesFound = data || [];

      // Enrich with district + province names for context
      const enriched = await Promise.all(
        citiesFound.map(async (city) => {
          const { data: ds } = await fetchDistrictsByProvince(city.province_id);
          const district = (ds || []).find((d) => d.id === city.district_id);
          const province = provinces.find((p) => p.id === city.province_id);
          return {
            ...city,
            districtName: district?.name,
            provinceName: province?.name,
          };
        })
      );

      setGlobalResults(enriched);
      setGlobalSearching(false);
      setShowGlobalResults(true);
    }, 300);
    return () => clearTimeout(t);
  }, [globalQuery, provinces]);

  // -------------------------- SELECTION / EMIT ------------------------------

  const selectedProvince = provinces.find((p) => p.id === selectedProvinceId);
  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);
  const selectedCity = cities.find((c) => c.id === selectedCityId);

  const emitChange = useCallback(
    (provinceId: string, districtId: string, cityId: string, cityOverride?: CityRow) => {
      if (!onLocationChange) return;

      const province = provinces.find((p) => p.id === provinceId);
      const district = districts.find((d) => d.id === districtId);
      const city = cityOverride || cities.find((c) => c.id === cityId);

      onLocationChange({
        provinceId,
        provinceName: province?.name || 'All Pakistan',
        districtId,
        districtName: district?.name || 'All Districts',
        tehsilId: 'all',
        tehsilName: 'All Tehsils',
        cityOrVillageId: cityId,
        cityOrVillageName: city?.name || 'All Areas',
        lat: city?.latitude != null ? Number(city.latitude) : DEFAULT_COORDS.lat,
        lng: city?.longitude != null ? Number(city.longitude) : DEFAULT_COORDS.lng,
      });
    },
    [onLocationChange, provinces, districts, cities]
  );

  // Keep the latest emit function in a ref so the selection effect below can
  // call it WITHOUT depending on its identity. `onLocationChange` is an
  // inline arrow in some parents (PakistanMap/Hero), so `emitChange` gets a
  // new identity on every parent re-render — depending on it re-triggered
  // this effect on every render and caused an infinite
  // emit → setState → re-render → emit loop on the home page (each iteration
  // programmatically scrolling the page and swallowing user clicks).
  const emitChangeRef = useRef(emitChange);
  useEffect(() => {
    emitChangeRef.current = emitChange;
  }, [emitChange]);

  // Emit ONLY in response to an explicit user selection change — never on
  // mount and never because a callback identity changed. Filtering (and any
  // scrolling it triggers in the app shell) must be strictly user-initiated.
  const userSelectedRef = useRef(false);
  useEffect(() => {
    if (!userSelectedRef.current) return;
    emitChangeRef.current(selectedProvinceId, selectedDistrictId, selectedCityId);
  }, [selectedProvinceId, selectedDistrictId, selectedCityId]);

  // User-driven pick handlers (mark the interaction so the effect above may
  // emit).
  const pickProvince = useCallback((id: string) => {
    userSelectedRef.current = true;
    setSelectedProvinceId(id);
  }, []);

  const pickDistrict = useCallback((id: string) => {
    userSelectedRef.current = true;
    setSelectedDistrictId(id);
  }, []);

  const pickCity = useCallback((id: string) => {
    userSelectedRef.current = true;
    setSelectedCityId(id);
  }, []);

  const handlePickGlobalResult = (city: CityRow & { districtName?: string; provinceName?: string }) => {
    // Sync the cascade to the picked city (explicit user action)
    userSelectedRef.current = true;
    setSelectedProvinceId(city.province_id);
    void loadDistricts(city.province_id).then(() => {
      setSelectedDistrictId(city.district_id);
      void loadCities(city.district_id).then(() => {
        setSelectedCityId(city.id);
        emitChange(city.province_id, city.district_id, city.id, city);
      });
    });
    setGlobalQuery('');
    setShowGlobalResults(false);
  };

  const handleReset = () => {
    userSelectedRef.current = true;
    const alreadyAll =
      selectedProvinceId === 'all' && selectedDistrictId === 'all' && selectedCityId === 'all';
    setSelectedProvinceId('all');
    setSelectedDistrictId('all');
    setSelectedCityId('all');
    setGlobalQuery('');
    setIsMapVisible(false);
    // When the values were already "all" the selection effect won't re-run,
    // so emit the reset explicitly (still a direct user action).
    if (alreadyAll) emitChangeRef.current('all', 'all', 'all');
  };

  // -------------------------- RENDER HELPERS --------------------------------

  const renderDropdown = (
    level: 'province' | 'district' | 'city',
    label: string,
    currentLabel: string,
    options: { id: string; name: string }[],
    currentValue: string,
    onPick: (id: string) => void,
    disabled: boolean,
    allLabel: string
  ) => {
    const isOpen = openDropdown === level;
    const query = dropdownSearch.toLowerCase();
    const filtered = query
      ? options.filter((o) => o.name.toLowerCase().includes(query))
      : options;

    return (
      <div className="relative flex-1 min-w-[150px]">
        <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpenDropdown(isOpen ? null : level);
            setDropdownSearch('');
          }}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
              : isOpen
              ? 'bg-white dark:bg-slate-950 border-emerald-500 text-slate-900 dark:text-white ring-1 ring-emerald-500/40'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-500/50'
          }`}
        >
          <span className="truncate flex items-center gap-1.5">
            {loadingLevel === level ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="truncate">{currentLabel}</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`absolute z-40 top-full mt-2 w-full min-w-[220px] rounded-2xl border shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder={`Search ${label.toLowerCase()}...`}
                    className="w-full bg-transparent text-xs focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onPick('all');
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    currentValue === 'all'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{allLabel}</span>
                  {currentValue === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>

                {filtered.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[11px] text-slate-400">
                    No matches found.
                  </div>
                ) : (
                  filtered.map((o) => (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => {
                        onPick(o.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        currentValue === o.id
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{o.name}</span>
                      {currentValue === o.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ------------------------------ RENDER ------------------------------------

  const summaryLabel = selectedCity
    ? `${selectedCity.name}, ${selectedDistrict?.name || ''}, ${selectedProvince?.name || ''}`
    : selectedDistrict
    ? `${selectedDistrict.name}, ${selectedProvince?.name || ''}`
    : selectedProvince
    ? selectedProvince.name
    : 'All Pakistan';

  return (
    <div ref={containerRef} className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Global quick search */}
      <div className="relative">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Search className="w-4 h-4 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            onFocus={() => globalResults.length > 0 && setShowGlobalResults(true)}
            placeholder="Quick-search any Pakistani city (e.g. Lahore, Skardu, Gwadar)..."
            className="w-full bg-transparent text-xs focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
          />
          {globalSearching && <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />}
          {globalQuery && (
            <button type="button" onClick={() => setGlobalQuery('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showGlobalResults && globalResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`absolute z-40 top-full mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="max-h-60 overflow-y-auto p-1.5">
                {globalResults.map((city) => (
                  <button
                    type="button"
                    key={city.id}
                    onClick={() => handlePickGlobalResult(city)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {city.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold truncate">
                      {city.districtName ? `${city.districtName} • ` : ''}{city.provinceName || ''}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error state with retry — never silently falls back to fake data */}
      {loadError && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Could not load locations: {loadError}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              void loadProvinces();
              if (selectedProvinceId !== 'all') void loadDistricts(selectedProvinceId);
              if (selectedDistrictId !== 'all') void loadCities(selectedDistrictId);
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-bold shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3 cascading searchable dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        {renderDropdown(
          'province',
          'Province',
          selectedProvince?.name || 'All Pakistan',
          provinces.map((p) => ({ id: p.id, name: p.name })),
          selectedProvinceId,
          pickProvince,
          false,
          'All Pakistan'
        )}

        {renderDropdown(
          'district',
          'District',
          selectedDistrict?.name || 'All Districts',
          districts.map((d) => ({ id: d.id, name: d.name })),
          selectedDistrictId,
          pickDistrict,
          selectedProvinceId === 'all',
          'All Districts'
        )}

        {renderDropdown(
          'city',
          'City',
          selectedCity?.name || 'All Areas',
          cities.map((c) => ({ id: c.id, name: c.name })),
          selectedCityId,
          pickCity,
          selectedDistrictId === 'all',
          'All Areas'
        )}
      </div>

      {/* Selected summary + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold ${
          isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <Globe className="w-3.5 h-3.5" />
          <span>{summaryLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {showMapVerification && selectedCity && selectedCity.latitude != null && (
            <button
              type="button"
              onClick={() => setIsMapVisible(!isMapVisible)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isDarkMode
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isMapVisible ? 'Hide Map' : 'Verify on Map'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Optional map verification */}
      <AnimatePresence>
        {isMapVisible && selectedCity && selectedCity.latitude != null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GoogleLocationMap
              lat={Number(selectedCity.latitude)}
              lng={Number(selectedCity.longitude)}
              locationName={selectedCity.name}
              district={selectedDistrict?.name}
              province={selectedProvince?.name}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
