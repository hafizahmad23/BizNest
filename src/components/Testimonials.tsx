import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ShieldCheck } from 'lucide-react';

interface TestimonialsProps {
  isDarkMode: boolean;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ isDarkMode }) => {
  const TESTIMONIALS = [
    {
      name: 'Chaudhry Kamran',
      role: 'Owner, Botanical Greens Nursery',
      city: 'Lahore (Phase 5 DHA)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      text: 'BizNest changed how clients find us. Within 2 weeks of getting our Verified Hub badge, we received 120+ direct WhatsApp leads for indoor plants. The AI description generator was super helpful!'
    },
    {
      name: 'Dr. Fatima Tariq',
      role: 'Aesthetic Dermatologist',
      city: 'Islamabad (F-7 Markaz)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      text: 'Having a transparent Trust Score and verified response time on our BizNest profile gives patients instant confidence. It is hands down the best business platform in Pakistan.'
    },
    {
      name: 'Zain-ul-Abidin',
      role: 'CEO, SolarTech Energy',
      city: 'Multan & Bahawalpur',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      text: 'BizNest is not just a directory, it’s a complete business discovery engine. Our net metering leads doubled in Multan within a single month.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-purple-700 dark:text-purple-400 tracking-wider uppercase bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20">
          Entrepreneur Stories
        </span>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Trusted by Pakistan’s Leading Businesses
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`p-6 rounded-3xl border flex flex-col justify-between relative ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-md hover:shadow-lg transition-all'
            }`}
          >
            <div className="mb-6">
              <div className="flex items-center gap-1 text-amber-500 mb-4 text-sm">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 italic">
                "{t.text}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{t.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.role} • {t.city}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
