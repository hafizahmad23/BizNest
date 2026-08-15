import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle2, XCircle, BarChart3, Users, Building2, MapPin, DollarSign, Award } from 'lucide-react';
import { Business } from '../types';

interface AdminPanelProps {
  businesses: Business[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isDarkMode: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  businesses,
  onApprove,
  onReject,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'analytics' | 'cities'>('approvals');

  const pendingList = businesses.filter(b => b.status === 'pending' || !b.isVerified);

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
          <p className="text-xs sm:text-sm text-slate-400">Manage business approvals, platform revenue, trust score verifications, and city listings.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Verification Queue ({pendingList.length})</span>
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
          <span>Platform Revenue & Metrics</span>
        </button>
      </div>

      {/* APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Pending Verification Submissions</h2>
          {pendingList.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#0d1322] border border-slate-800 text-slate-400 text-sm">
              All business submissions are verified and approved!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((b) => (
                <div key={b.id} className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={b.logoImage} alt={b.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <div className="font-bold text-sm text-white">{b.name}</div>
                      <div className="text-xs text-slate-400">{b.category} • {b.city} • Contact: {b.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onApprove(b.id)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      onClick={() => onReject(b.id)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/30"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly Recurring Subscriptions</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">PKR 4.8M</div>
              <div className="text-[10px] text-emerald-300 mt-1">1,920 Premium Accounts</div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Featured Listing Ad Revenue</div>
              <div className="text-3xl font-black text-cyan-400 mt-1">PKR 1.2M</div>
              <div className="text-[10px] text-cyan-300 mt-1">480 Active Homepage Banners</div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 text-white">
              <div className="text-xs font-bold text-slate-400 uppercase">Lead Verification API Calls</div>
              <div className="text-3xl font-black text-purple-400 mt-1">184,500+</div>
              <div className="text-[10px] text-purple-300 mt-1">99.4% Delivery Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
