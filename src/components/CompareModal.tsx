import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, MessageCircle } from 'lucide-react';
import { Business } from '../types';

interface CompareModalProps {
  businesses: Business[];
  onClose: () => void;
  onRemove: (id: string) => void;
  isDarkMode: boolean;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  businesses,
  onClose,
  onRemove,
  isDarkMode
}) => {
  if (businesses.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
          className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col p-6 ${
            isDarkMode ? 'bg-[#030712]/95 border-white/10 backdrop-blur-2xl text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Side-by-Side Business Comparison</h2>
                <p className="text-xs text-slate-400">Comparing {businesses.length} selected providers</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comparison Matrix Table */}
          <div className="overflow-x-auto py-6 flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-3 text-xs font-bold text-slate-400 uppercase w-40">Attribute</th>
                  {businesses.map((b) => (
                    <th key={b.id} className="p-3 text-sm font-bold text-white relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate max-w-[160px]">{b.name}</span>
                        <button
                          onClick={() => onRemove(b.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <img
                        src={b.coverImage}
                        alt={b.name}
                        className="w-full h-24 object-cover rounded-xl border border-slate-800"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                <tr>
                  <td className="p-3 font-bold text-slate-400">Profile Views</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3 font-mono font-black text-cyan-400 text-sm">
                      {(b.viewsCount || 0).toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">Total Reviews</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3 font-semibold text-amber-400">
                      {b.reviewCount || 0}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">Verification</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3">
                      {b.isVerified ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          Verified Hub
                        </span>
                      ) : (
                        <span className="text-slate-500">Standard</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">Category & City</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3 font-medium text-slate-200">
                      {b.category} • {b.city}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">User Rating</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3 font-bold text-yellow-400">
                      {b.reviewCount > 0 ? (
                        <>★ {b.rating.toFixed(1)} ({b.reviewCount} reviews)</>
                      ) : (
                        <span className="text-slate-500 font-normal">No reviews yet</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">Price Tier</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3 font-semibold text-white">
                      {b.priceRange || '—'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-bold text-slate-400">Action</td>
                  {businesses.map((b) => (
                    <td key={b.id} className="p-3">
                      {b.whatsapp ? (
                        <a
                          href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(b.name)},%20I%20found%20you%20on%20BizNest.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">No WhatsApp listed</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
