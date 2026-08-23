import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle, Search } from 'lucide-react';

interface TestimonialsProps {
  isDarkMode: boolean;
}

/**
 * "What BizNest Can Do" — honest product capability cards.
 * (This section previously contained fabricated customer testimonials with
 * invented names and metrics. Those were removed — real user reviews live
 * on each business profile and come from the database.)
 */
export const Testimonials: React.FC<TestimonialsProps> = ({ isDarkMode }) => {
  const CAPABILITIES = [
    {
      icon: Search,
      title: 'Get Discovered by Local Customers',
      text: 'List your business for free and appear in category and city searches across Pakistan. Customers can call or WhatsApp you directly from your profile.'
    },
    {
      icon: MessageCircle,
      title: 'Receive Inquiries in One Inbox',
      text: 'Customer lead inquiries, chat conversations, and orders land directly in your merchant dashboard — so you never miss a potential sale.'
    },
    {
      icon: Sparkles,
      title: 'AI-Generated Business Profiles',
      text: 'Use the built-in Gemini AI assistant to draft a unique description, tagline, and SEO keywords for your listing in seconds — based only on the details you provide.'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold text-purple-700 dark:text-purple-400 tracking-wider uppercase bg-purple-50 dark:bg-purple-500/10 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/20">
          Platform Capabilities
        </span>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}>
          What BizNest Can Do
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Real features available today — no invented success stories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CAPABILITIES.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border relative ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900 shadow-md hover:shadow-lg transition-all'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm mb-2 text-slate-900 dark:text-white">{cap.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {cap.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
