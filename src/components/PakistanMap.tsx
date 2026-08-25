import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Building2, Compass, ArrowUpRight, Globe, Layers } from 'lucide-react';
import { PAKISTAN_CITIES } from '../data/mockData';
import { CascadingLocationSelector, LocationSelectionValue } from './CascadingLocationSelector';
import {
  fetchCityBusinessCounts,
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchCitiesByDistrict,
} from '../lib/supabaseDB';

interface PakistanMapProps {
  onSelectCity: (cityName: string) => void;
  selectedCity: string;
  isDarkMode: boolean;
}

/**
 * Location explorer backed by the Supabase location tables and REAL
 * per-city business counts (0 is shown honestly when a city has none).
 */
export const PakistanMap: React.FC<PakistanMapProps> = ({
  onSelectCity,
  selectedCity,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'cascading' | 'cities'>('cascading');
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ provinces: 0, districts: 0, cities: 0 });

  useEffect(() => {
    let active = true;

    fetchCityBusinessCounts().then(({ data }) => {
      if (active && data) setCityCounts(data);
    });

    Promise.all([
      fetchProvinces(),
      fetchDistrictsByProvince('all'),
      fetchCitiesByDistrict('all'),
    ]).then(([p, d, c]) => {
      if (!active) return;
      setStats({
        provinces: p.data?.length || 0,
        districts: d.data?.length || 0,
        cities: c.data?.length || 0,
      });
    });

    return () => {
      active = false;
    };
  }, []);

  // Stable identity: the selector keeps callbacks in effects, so an inline
  // arrow here would churn subscriptions/derivatives in children on every
  // render of this component.
  const handleCascadingChange = useCallback(
    (loc: LocationSelectionValue) => {
      // Determine the most specific selected area
      const target =
        loc.cityOrVillageName !== 'All Areas'
          ? loc.cityOrVillageName
          : loc.districtName !== 'All Districts'
          ? loc.districtName
          : loc.provinceName !== 'All Pakistan'
          ? loc.provinceName
          : 'all';

      onSelectCity(target === 'All Pakistan' ? 'all' : target);
    },
    [onSelectCity]
  );

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className={`p-6 sm:p-10 rounded-3xl border overflow-hidden relative transition-all ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 shadow-2xl text-white'
          : 'bg-white border-slate-200 shadow-xl text-slate-900'
      }`}>
        {/* Glow lights */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
              <Compass className="w-3.5 h-3.5 animate-spin-slow text-emerald-600 dark:text-emerald-400" />
              <span>National Location Directory</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Complete Pakistan Location Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 max-w-2xl">
              Filter businesses across every Province, District, and City from our live database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cascading')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'cascading'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Cascading Selector</span>
            </button>
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'cities'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Top Metros</span>
            </button>
          </div>
        </div>

        {/* Administrative Hierarchy Stats Bar (live DB counts) */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-semibold">Provinces:</span>
            <span className="font-extrabold text-emerald-400">{stats.provinces} Regions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400 font-semibold">Districts:</span>
            <span className="font-extrabold text-cyan-400">{stats.districts} Districts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400 font-semibold">Cities:</span>
            <span className="font-extrabold text-amber-400">{stats.cities} Cities</span>
          </div>
        </div>

        {/* Tab 1: Cascading Location Selector */}
        {activeTab === 'cascading' ? (
          <div className="relative z-10">
            <CascadingLocationSelector
              onLocationChange={handleCascadingChange}
              isDarkMode={isDarkMode}
              showMapVerification={true}
            />
          </div>
        ) : (
          /* Tab 2: City Cards Grid — with REAL business counts from the DB */
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {PAKISTAN_CITIES.map((city, idx) => {
              const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
              const realCount = cityCounts[city.name.toLowerCase()] ?? 0;

              return (
                <motion.div
                  key={city.id}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectCity(city.name)}
                  className={`group relative h-40 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-2xl scale-[1.02]'
                      : 'border-slate-700/80 hover:border-emerald-500/50 hover:scale-[1.01]'
                  }`}
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.65] group-hover:brightness-[0.75]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-slate-700">
                        {city.province}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-slate-700 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>{city.name}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium mt-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {realCount > 0
                            ? `${realCount.toLocaleString()} Listed Business${realCount === 1 ? '' : 'es'}`
                            : 'No listings yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
