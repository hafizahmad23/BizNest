import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, BarChart3, Award, Users, Building2, Star, Inbox, ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AdminStats, Business, Review } from '../types';
import { fetchAllReviewsForAdmin, moderateReview } from '../lib/supabaseDB';

interface AdminPanelProps {
  businesses: Business[]; // pending submissions from the DB
  stats: AdminStats | null; // real COUNT(*) queries from the DB
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  isDarkMode: boolean;
}

/**
 * Platform administration. Every number on this screen comes from a real
 * database COUNT query — nothing is hardcoded. Access to this component is
 * additionally restricted by profiles.role = 'admin' (App gate) AND
 * server-side RLS + is_admin() policies.
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({
  businesses,
  stats,
  onApprove,
  onReject,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'analytics' | 'reviews'>('approvals');
  const [rejectReasonId, setRejectReasonId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'reviews') return;
    setReviewsLoading(true);
    fetchAllReviewsForAdmin().then(({ data }) => {
      setAdminReviews(data || []);
      setReviewsLoading(false);
    });
  }, [activeTab]);

  const handleToggleModeration = async (review: Review) => {
    const hidden = Boolean((review as any).verifiedPurchase); // reuse flag as isModerated marker
    const { error } = await moderateReview(review.id, !hidden);
    if (!error) {
      setAdminReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? ({ ...r, verifiedPurchase: !hidden } as Review) : r
        )
      );
    }
  };

  const card = `p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white`;
  const num = (v?: number) => (v ?? 0).toLocaleString();

  return (
    <div className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold mb-2 border border-purple-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>BizNest Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Ecosystem Control Panel</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Approve listings, moderate reviews, and monitor real platform metrics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Approval Queue ({businesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Review Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Metrics</span>
        </button>
      </div>

      {/* APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Pending Listing Submissions</h2>
          {businesses.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#0d1322] border border-slate-800 text-slate-400 text-sm">
              No pending submissions right now. New business listings will appear here for review.
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map((b) => (
                <div key={b.id} className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {b.logoImage ? (
                        <img src={b.logoImage} alt={b.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-white">{b.name}</div>
                        <div className="text-xs text-slate-400">
                          {b.category} • {b.city}{b.district ? `, ${b.district}` : ''} • Contact: {b.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Approve publishes the listing — it does NOT auto-verify */}
                      <button
                        onClick={() => onApprove(b.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        onClick={() => setRejectReasonId(rejectReasonId === b.id ? null : b.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {b.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{b.description}</p>
                  )}

                  {rejectReasonId === b.id && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection (sent to the owner)…"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          onReject(b.id, rejectReason || undefined);
                          setRejectReasonId(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Latest Customer Reviews</h2>
          {reviewsLoading ? (
            <div className="p-8 text-center rounded-3xl bg-[#0d1322] border border-slate-800 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            </div>
          ) : adminReviews.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#0d1322] border border-slate-800 text-slate-400 text-sm">
              No reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {adminReviews.map((r) => {
                const hidden = Boolean((r as any).verifiedPurchase);
                return (
                  <div key={r.id} className={`p-4 rounded-3xl bg-[#0d1322] border text-white space-y-1.5 ${
                    hidden ? 'border-rose-500/40 opacity-60' : 'border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-bold text-sm">
                        {r.userName} <span className="text-[10px] text-slate-500 font-normal">({r.userCity})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                        <button
                          onClick={() => handleToggleModeration(r)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 border transition ${
                            hidden
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {hidden ? 'Unhide' : 'Hide'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{r.comment || '(no comment)'}</p>
                    <div className="text-[10px] text-slate-500">
                      {r.date} {hidden && '• hidden from public view'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS — every number is a real DB COUNT */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Users className="w-4 h-4" /> Registered Users
              </div>
              <div className="text-3xl font-black text-emerald-400 mt-1">{num(stats?.totalUsers)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Total profiles in the database</div>
            </div>

            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Total Listings
              </div>
              <div className="text-3xl font-black text-cyan-400 mt-1">{num(stats?.totalBusinesses)}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                {num(stats?.activeBusinesses)} active • {num(stats?.pendingBusinesses)} pending • {num(stats?.rejectedBusinesses)} rejected
              </div>
            </div>

            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Award className="w-4 h-4" /> Featured / Premium
              </div>
              <div className="text-3xl font-black text-purple-400 mt-1">
                {num(stats?.featuredBusinesses)} / {num(stats?.premiumBusinesses)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Admin-assigned promotional flags</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Star className="w-4 h-4" /> Customer Reviews
              </div>
              <div className="text-3xl font-black text-amber-400 mt-1">{num(stats?.totalReviews)}</div>
              <div className="text-[10px] text-slate-500 mt-1">All reviews ever submitted</div>
            </div>

            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <Inbox className="w-4 h-4" /> Lead Inquiries
              </div>
              <div className="text-3xl font-black text-pink-400 mt-1">{num(stats?.totalLeads)}</div>
              <div className="text-[10px] text-slate-500 mt-1">Real customer inquiries sent to merchants</div>
            </div>

            <div className={card}>
              <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Orders Placed
              </div>
              <div className="text-3xl font-black text-blue-400 mt-1">{num(stats?.totalOrders)}</div>
              <div className="text-[10px] text-slate-500 mt-1">All-time orders through checkout</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
