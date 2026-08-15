import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, Building2, Zap, ShieldCheck, X, Clock, Lock, Gift, CheckCircle2 } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
  isDarkMode: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  isDarkMode
}) => {
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);

  const STARTER_PLAN = {
    name: 'Starter Listing',
    tagline: 'Ideal for local shops, nurseries, freelancers & service providers getting discovered.',
    price: 'PKR 0',
    subtitle: 'Free Forever',
    popular: false,
    color: 'border-emerald-500/80 shadow-emerald-500/10',
    features: [
      'Full Business Profile Listing across Pakistan',
      'Direct Call & WhatsApp Chat Buttons',
      'Listed in Category & City Hub Directories',
      'Receive Real-Time Customer Lead Inquiries',
      '1-Click AI Description Generator Included (Free)',
      'Product & Service Catalog Uploads',
      'Customer Reviews & Trust Score Rating'
    ]
  };

  const PREMIUM_PLANS = [
    {
      name: 'BizNest Premium',
      tagline: 'Advanced AI priority ranking, custom domain mapping & instant lead automation.',
      price: 'PKR 2,500',
      period: '/ month',
      badge: 'Under Development',
      features: [
        'Verified Hub Gold Shield Badge',
        'Top #1 Priority Rank in City Search',
        'Automated WhatsApp Inquiry Auto-Responder',
        'Unlimited Catalog & Video Showcases',
        'Featured Banner on Homepage'
      ]
    },
    {
      name: 'Enterprise Ecosystem',
      tagline: 'Multi-branch management, dedicated AI agent & custom API integrations.',
      price: 'PKR 7,500',
      period: '/ month',
      badge: 'Under Development',
      features: [
        'Multi-City Branch Management',
        'Custom AI Assistant Trained on Your Inventory',
        'Direct CRM API & Webhook Access',
        'Dedicated VIP Account Manager',
        'Nationwide Featured Spotlight Ads'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* 1. Header Banner: 100% Free Launch Announcement */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 tracking-wider uppercase bg-purple-100 dark:bg-purple-500/15 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-500/30 shadow-sm">
          <Gift className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-bounce" />
          <span>Official Launch Celebration</span>
        </span>

        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          100% Free Access During Launch Phase
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          To empower Pakistani businesses, entrepreneurs, and local shop owners, <strong className="text-emerald-600 dark:text-emerald-400">all features are completely FREE</strong> during our official launch. No credit card or payment required — join early and build your digital presence with zero cost!
        </p>

        {/* Free Trust Banner Card */}
        <div className={`p-4 sm:p-5 rounded-2xl border text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg ${
          isDarkMode ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/40 border-emerald-500/40' : 'bg-gradient-to-r from-emerald-50 via-white to-purple-50 border-emerald-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>All Core & AI Features Unlocked For Free</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] uppercase font-black">Free Launch</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Create listings, generate AI descriptions, receive direct WhatsApp inquiries, and manage your catalog with zero recurring fees during our launch period.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('Starter Listing')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 shadow-md transition cursor-pointer"
          >
            Claim Free Launch Access →
          </button>
        </div>
      </div>

      {/* 2. Grid: Unlocked Free Starter Plan + Blurred Premium Plans with "Coming Soon" Overlay */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Free Active Starter Plan (Col span 5) */}
        <div className={`lg:col-span-5 p-6 sm:p-8 rounded-3xl border flex flex-col justify-between relative shadow-xl transition-all ${
          isDarkMode ? 'bg-[#0d1322] border-emerald-500/50 text-white' : 'bg-white border-emerald-400 text-slate-900 shadow-emerald-100/50'
        }`}>
          <div className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>Active & Unlocked • 100% Free</span>
          </div>

          <div>
            <div className="mb-4 pt-1">
              <h3 className="text-2xl font-black">{STARTER_PLAN.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{STARTER_PLAN.tagline}</p>
            </div>

            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{STARTER_PLAN.price}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ Free Launch Access</span>
            </div>

            <ul className="space-y-3.5 mb-8">
              {STARTER_PLAN.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('Starter Listing')}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Get Started For Free Now
          </button>
        </div>

        {/* Right: Blurred Premium Plans with "Coming Soon" Banner (Col span 7) */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 p-1">
          {/* Blurred Cards Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 filter blur-[2px] opacity-60 pointer-events-none select-none">
            {PREMIUM_PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              >
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold uppercase border border-amber-500/30">
                    {plan.badge}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 my-2">{plan.tagline}</p>
                  <div className="text-2xl font-black my-3">
                    {plan.price} <span className="text-xs text-slate-400 font-normal">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-400 mb-4">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-slate-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs text-center">
                  Coming Soon
                </div>
              </div>
            ))}
          </div>

          {/* Prominent Overlay Card: "Coming Soon" Label */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-slate-900/95 border border-purple-500/50 shadow-2xl text-center text-white space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20 border border-purple-400/30">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold uppercase tracking-widest">
                  Coming Soon • Under Active Development
                </span>
                <h3 className="text-xl font-extrabold mt-2.5">Premium Subscription Tiers</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Our advanced paid monetization packages and enterprise AI extensions are currently in development.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-xs text-purple-200 text-left space-y-1 font-medium">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Early Bird Advantage:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  All early merchants get complete, unrestricted access to listing, AI keyword tools, and lead management <strong>100% FREE</strong> during this launch phase!
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPlanModal('Free Launch Access');
                  onSelectPlan('Starter Listing');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 text-slate-950 font-black text-xs shadow-xl transition cursor-pointer hover:opacity-95"
              >
                Join Early For Free Now →
              </button>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Free Launch Info Modal if clicked */}
      <AnimatePresence>
        {selectedPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedPlanModal(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#0d1322] border border-slate-800 text-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-400" />
                  <span>100% Free Launch Registration</span>
                </h3>
                <button onClick={() => setSelectedPlanModal(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
                🎉 <strong>No payment needed!</strong> During our official launch phase, all BizNest merchant features, AI description tools, and customer lead inquiries are completely free.
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant listing across Pakistan cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click Gemini AI description & SEO keyword builder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct WhatsApp inquiry button for customers</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlanModal(null);
                  onSelectPlan('Starter Listing');
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition"
              >
                Proceed to Business Setup →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
