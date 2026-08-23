import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, Star, LayoutGrid, Zap } from 'lucide-react';
import { fetchPlatformStats } from '../lib/supabaseDB';
import { PlatformStats } from '../types';

interface LiveStatsProps {
  isDarkMode: boolean;
}

/**
 * Platform statistics — REAL counts from the Supabase database.
 * When a count is 0, it honestly displays 0 (never invented numbers).
 */
export const LiveStats: React.FC<LiveStatsProps> = ({ isDarkMode }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let active = true;
    fetchPlatformStats().then(({ data }) => {
      if (active && data) setStats(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: 'Active Businesses',
      value: (stats?.totalBusinesses ?? 0).toLocaleString(),
      subtext: 'Live on BizNest',
      icon: Building2,
      color: 'from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
    },
    {
      label: 'Cities Covered',
      value: (stats?.totalCities ?? 0).toLocaleString(),
      subtext: 'With listed businesses',
      icon: MapPin,
      color: 'from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
    },
    {
      label: 'Customer Reviews',
      value: (stats?.totalReviews ?? 0).toLocaleString(),
      subtext: 'Real written reviews',
      icon: Star,
      color: 'from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-pink-400',
      iconBg: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
    },
    {
      label: 'Active Categories',
      value: (stats?.totalCategories ?? 0).toLocaleString(),
      subtext: 'Sectors with listings',
      icon: LayoutGrid,
      color: 'from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400',
      iconBg: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
    }
  ];

  return (
    <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 shadow-2xl shadow-emerald-950/20 hover:border-white/20 backdrop-blur-md'
                  : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Live
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black tracking-tight mb-0.5">
                <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </span>
              </div>

              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                {stat.label}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {stat.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
