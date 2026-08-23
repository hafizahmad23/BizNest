import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Star, Eye, MapPin, Phone, MessageCircle, Sparkles, Scale } from 'lucide-react';
import { Business } from '../types';

interface BusinessCardProps {
  business: Business;
  onViewDetail: (biz: Business) => void;
  onToggleCompare?: (biz: Business) => void;
  isCompared?: boolean;
  isDarkMode: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onViewDetail,
  onToggleCompare,
  isCompared = false,
  isDarkMode
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group relative ${
        isDarkMode
          ? 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md'
          : 'bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-slate-200'
      }`}
    >
      {/* Top Cover Image & Overlay Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onViewDetail(business)}>
        <img
          src={business.coverImage}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 text-[11px] font-bold text-white shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{business.category}</span>
        </div>

        {/* Compare Checkbox */}
        {onToggleCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(business); }}
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md transition border shadow-md ${
              isCompared
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-purple-600/30 hover:text-purple-200'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>
        )}

        {/* Verified Shield Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {business.isVerified && (
            <div className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold text-[10px] shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED HUB</span>
            </div>
          )}
        </div>

        {/* Rating Badge — REAL average from the reviews table */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-950/90 text-yellow-400 px-2 py-0.5 rounded-md font-bold text-xs border border-slate-800">
          <Star className="w-3.5 h-3.5 fill-yellow-400" />
          {business.reviewCount > 0 ? (
            <>
              <span>{business.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">({business.reviewCount})</span>
            </>
          ) : (
            <span className="text-[10px] text-slate-300">New</span>
          )}
        </div>
      </div>

      {/* Main Body Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Logo & Title */}
          <div className="flex items-start gap-3 mb-2">
            <img
              src={business.logoImage}
              alt={business.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/80 shadow-md shrink-0 bg-slate-100 dark:bg-slate-900"
            />
            <div className="flex-1 min-w-0">
              <h3 
                onClick={() => onViewDetail(business)}
                className={`text-base font-bold tracking-tight truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                {business.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                {business.tagline}
              </p>
            </div>
          </div>

          {/* AI Summary Highlight */}
          {business.aiSummary && (
            <div className={`my-3 p-2.5 rounded-xl border text-[11px] leading-snug flex items-start gap-1.5 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-950/30 to-slate-900/40 border-purple-500/20 text-purple-200'
                : 'bg-purple-50/80 border-purple-200 text-purple-900'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2">
                <strong className="font-semibold text-purple-800 dark:text-purple-300">AI Insight:</strong> {business.aiSummary}
              </p>
            </div>
          )}

          {/* Location & Views Meta (real counters) */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 my-2 font-medium">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{business.city}</span>
            </span>

            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span><strong>{business.viewsCount || 0}</strong> views</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          {/* Direct WhatsApp (only when the owner provided a number) */}
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(business.name)},%20I%20found%20you%20on%20BizNest%20and%20would%20like%20to%20inquire.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-500/15 dark:hover:bg-emerald-500 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:text-slate-950 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Phone Call */}
          <a
            href={`tel:${business.phone}`}
            onClick={(e) => e.stopPropagation()}
            className={`p-2 rounded-xl border text-xs font-semibold transition ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={`Call ${business.phone}`}
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* View Profile */}
          <button
            onClick={() => onViewDetail(business)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs shadow-sm transition"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};
