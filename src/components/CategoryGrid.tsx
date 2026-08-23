import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Sprout, Utensils, Coffee, Hotel, Hospital, ShoppingBag, Stethoscope,
  Laptop, Wrench, Home, GraduationCap, Scissors, Camera, Scale, Dumbbell, Car,
  Zap, Droplets, Building2
} from 'lucide-react';
import { POPULAR_CATEGORIES } from '../data/mockData';
import { fetchCategories } from '../lib/supabaseDB';
import { CategoryItem } from '../types';

interface CategoryGridProps {
  onSelectCategory: (categoryName: string) => void;
  selectedCategory: string;
  isDarkMode: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout, Utensils, Coffee, Hotel, Hospital, ShoppingBag, Stethoscope,
  Laptop, Wrench, Home, GraduationCap, Scissors, Camera, Scale, Dumbbell, Car,
  Zap, Droplets, Building2
};

/**
 * Category grid — definitions from the DB categories table (seeded to match
 * the 16 canonical categories) with REAL active-business counts.
 * A category with 0 businesses honestly shows 0.
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
  isDarkMode
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(POPULAR_CATEGORIES);

  useEffect(() => {
    let active = true;
    fetchCategories().then(({ data, error }) => {
      if (!active || error || !data) return;

      // Merge real DB counts onto the local definitions (matched by slug).
      setCategories(
        POPULAR_CATEGORIES.map((local) => {
          const dbCat = data.find((d) => d.slug === local.slug || d.name === local.name);
          return dbCat
            ? { ...local, id: dbCat.id, count: dbCat.count, iconName: dbCat.iconName || local.iconName }
            : local;
        })
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            Pakistan Business Hub
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Popular Business Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore specialized sectors across Pakistan. Select a category to discover providers near you.
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            Reset category filter (Showing: {selectedCategory})
          </button>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {categories.map((cat, idx) => {
          const IconComponent = ICON_MAP[cat.iconName] || Building2;
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

          return (
            <motion.button
              key={cat.slug || cat.id}
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelectCategory(cat.name)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                isSelected
                  ? isDarkMode
                    ? 'bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-slate-900 border-emerald-400'
                    : 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                  : isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:-translate-y-0.5'
                  : 'bg-white border-slate-200/90 hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-3 w-full">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-slate-950'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </div>

              <div>
                <h3 className={`text-xs font-bold leading-tight ${
                  isSelected ? 'text-emerald-800 dark:text-emerald-400' : isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'
                }`}>
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                  {cat.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
