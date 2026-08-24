import React from 'react';
import { Building2, Heart, MessageCircle } from 'lucide-react';
import { PAKISTAN_CITIES, POPULAR_CATEGORIES } from '../data/mockData';

export const BIZNEST_SUPPORT = {
  whatsappNumber: '923231040318',
  whatsappFormatted: '+92 323 1040318',
  email: 'biznestpk0@gmail.com',
};

interface FooterProps {
  onNavigate: (view: any) => void;
  onSelectCity: (cityName: string) => void;
  onSelectCategory: (categoryName: string) => void;
  isDarkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectCity,
  onSelectCategory,
  isDarkMode
}) => {
  const whatsappUrl = `https://wa.me/${BIZNEST_SUPPORT.whatsappNumber}?text=${encodeURIComponent('Hello BizNest Support, I have a question regarding listing my business.')}`;

  return (
    <footer className={`border-t transition-all ${
      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        {/* Top Newsletter & Contact Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800/80">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-slate-700 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                BizNest Platform
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Discover. Connect. Grow. Everything Your Business Needs, In One Place. Pakistan’s leading digital business discovery platform, connecting local entrepreneurs, nurseries, restaurants, doctors, lawyers & freelancers.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>100% Free Launch Access • Operating Online Across Pakistan</span>
            </div>
          </div>

          {/* Quick Contact & WhatsApp Box */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 max-w-xl ml-auto w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Need Instant Support?</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Reach our representative directly on WhatsApp or Email.</p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0 transition"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">WhatsApp Support</span>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-400 hover:underline">
                    {BIZNEST_SUPPORT.whatsappFormatted}
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Inquiries</span>
                  <a href={`mailto:${BIZNEST_SUPPORT.email}`} className="font-mono font-bold text-cyan-400 hover:underline truncate block">
                    {BIZNEST_SUPPORT.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-xs">
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Top Cities Directory</h5>
            <ul className="space-y-2 text-slate-400">
              {PAKISTAN_CITIES.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button onClick={() => onSelectCity(c.name)} className="hover:text-emerald-400 transition">
                    Businesses in {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-slate-400">
              {POPULAR_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => onSelectCategory(cat.name)} className="hover:text-emerald-400 transition">
                    {cat.name} Listings
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">BizNest Navigation</h5>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => onNavigate('businesses')} className="hover:text-emerald-400 transition">Explore All Businesses</button></li>
              <li><button onClick={() => onNavigate('categories')} className="hover:text-emerald-400 transition">Categories Index</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-emerald-400 transition">Merchant Pricing (Free Launch)</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition text-emerald-400 font-bold">Contact Support Desk</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Contact Details</h5>
            <div className="space-y-2 text-slate-400 text-xs">
              <p><strong className="text-white">Email:</strong> {BIZNEST_SUPPORT.email}</p>
              <p><strong className="text-white">WhatsApp:</strong> {BIZNEST_SUPPORT.whatsappFormatted}</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open WhatsApp Chat</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © {new Date().getFullYear()} BizNest Platform (Pakistan). All features 100% Free during Launch Phase.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for Pakistan’s Business Ecosystem</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
