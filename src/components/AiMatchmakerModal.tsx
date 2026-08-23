import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Bot, ArrowRight, Building2, Star } from 'lucide-react';
import { Business } from '../types';

interface AiMatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBusinesses: Business[];
  onSelectBusiness: (biz: Business) => void;
  isDarkMode: boolean;
}

export const AiMatchmakerModal: React.FC<AiMatchmakerModalProps> = ({
  isOpen,
  onClose,
  allBusinesses,
  onSelectBusiness,
  isDarkMode
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [matchedList, setMatchedList] = useState<Business[]>([]);
  const [matchError, setMatchError] = useState('');

  if (!isOpen) return null;

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setReasoning(null);
    setMatchedList([]);
    setMatchError('');

    try {
      const res = await fetch('/api/gemini/matchmaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt,
          // Send a compact summary of the REAL directory so Gemini only picks
          // from businesses that actually exist in Supabase.
          businesses: allBusinesses.map((b) => ({
            id: b.id,
            name: b.name,
            category: b.category,
            city: b.city,
            tagline: b.tagline,
            description: (b.description || '').slice(0, 280),
            rating: b.rating,
            reviewCount: b.reviewCount,
            isVerified: b.isVerified,
          })),
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data) {
        setMatchError(data?.error || 'AI Matchmaker is unavailable right now. Please try again.');
        return;
      }

      setReasoning(data.matchReasoning || null);

      const matches =
        data.matchedBusinessIds && Array.isArray(data.matchedBusinessIds)
          ? allBusinesses.filter((b) => data.matchedBusinessIds.includes(b.id))
          : [];

      setMatchedList(matches);
      if (matches.length === 0) {
        setMatchError(
          allBusinesses.length === 0
            ? 'No businesses are listed yet, so the AI has nothing to match against. Be the first to join BizNest Pakistan!'
            : 'No listed businesses matched your request yet. Try a broader query or check back soon as new businesses join.'
        );
      }
    } catch {
      setMatchError('Network error — could not reach the AI service. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const SAMPLE_PROMPTS = [
    'Find a plant nursery in Lahore with delivery service',
    'Best rooftop BBQ restaurant in Islamabad',
    'Certified software agency in Karachi for custom web apps',
    'Solar installer in Multan with net metering support'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden z-10 p-6 flex flex-col ${
            isDarkMode ? 'bg-[#030712]/95 border-white/10 backdrop-blur-2xl text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30">
                <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center text-purple-300">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  BizNest Smart Matchmaker
                </h2>
                <p className="text-xs text-slate-400">AI-powered business discovery across real listed businesses</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleMatch} className="my-5 space-y-3">
            <div className="relative">
              <textarea
                required
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what business, service, or product you need in plain English..."
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>AI Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-500">Try these sample queries:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-purple-500/40 text-left truncate max-w-xs"
                  >
                    "{p.slice(0, 42)}..."
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Error / honest empty state — never a fabricated match */}
          {matchError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <Building2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{matchError}</p>
            </div>
          )}

          {/* Results Display */}
          {reasoning && matchedList.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-800 max-h-[50vh] overflow-y-auto">
              {/* AI Reasoning Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
                <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Match Rationale</span>
                </div>
                <p className="leading-relaxed">{reasoning}</p>
              </div>

              {/* Matched Business Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase">Matched Business Profiles:</div>
                {matchedList.map((biz) => (
                  <div
                    key={biz.id}
                    onClick={() => {
                      onSelectBusiness(biz);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer group transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {biz.logoImage ? (
                        <img
                          src={biz.logoImage}
                          alt={biz.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-emerald-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition truncate">
                          {biz.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                          <span>{biz.category} • {biz.city}</span>
                          {biz.reviewCount > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {biz.rating.toFixed(1)} ({biz.reviewCount})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                        View Match
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
