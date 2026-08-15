import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Phone, Clock, MapPin, Send, CheckCircle2, Copy, Sparkles, ShieldCheck } from 'lucide-react';

interface ContactSectionProps {
  isDarkMode: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ isDarkMode }) => {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('Lahore');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const whatsappNumber = '923231040318';
  const whatsappFormatted = '+92 323 1040318';
  const supportEmail = 'BizNest0@gmail.com';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello BizNest Support, I have an inquiry regarding listing my business.')}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormSubject('');
      setFormMessage('');
    }, 4000);
  };

  return (
    <section id="contact" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-emerald-500/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Direct Assistance & Support</span>
        </span>
        <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Contact Our Support Team
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Have questions about listing your business, verifying your account, or reaching customer leads across Pakistan? Connect directly with our team via WhatsApp or Email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Contact Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Direct WhatsApp Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all shadow-xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 text-white'
                : 'bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border-emerald-300 text-slate-900 shadow-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-emerald-500/20" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 uppercase tracking-wider">
                Instant Response
              </span>
            </div>

            <h3 className="text-lg font-bold mb-1">WhatsApp Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Chat directly with our support team for instant account setups and quick guidance.
            </p>

            <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mb-4 tracking-tight">
              {whatsappFormatted}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Chat on WhatsApp Immediately</span>
            </a>
          </motion.div>

          {/* 2. Official Email Card */}
          <motion.div
            whileHover={{ y: -3 }}
            className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-lg ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 uppercase tracking-wider">
                Official Desk
              </span>
            </div>

            <h3 className="text-lg font-bold mb-1">Email Inquiries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Send detailed business proposals, partnerships, or official inquiry tickets.
            </p>

            <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mb-4 flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="truncate">{supportEmail}</span>
              <button
                onClick={handleCopyEmail}
                className="p-1 text-slate-400 hover:text-emerald-400 transition"
                title="Copy email address"
              >
                {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Send Official Email</span>
            </a>
          </motion.div>

          {/* 3. Coverage & SLA Card */}
          <div className={`p-5 rounded-3xl border text-xs space-y-3 ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>National Support SLA & Coverage</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Response Speed</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">&lt; 15 Minutes (WhatsApp)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Supported Cities</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">All 10+ Major PK Cities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative ${
            isDarkMode ? 'bg-[#0d1322] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-extrabold">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill out this quick form and our support team will reach back to you promptly.</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center hidden sm:flex">
                <Send className="w-5 h-5" />
              </div>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-center space-y-3 my-6"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Message Delivered Successfully!</h4>
                <p className="text-xs text-emerald-300 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting BizNest Support. Our representative will review your message and reply via WhatsApp or Email shortly.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md mt-2"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Follow Up on WhatsApp Now</span>
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mahmood"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Phone / WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+92 300 1234567"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.pk"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">City *</label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className={`w-full mt-1.5 p-3 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Other">Other Pakistani City</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Inquiry Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Request to verify my business listing / Partnership inquiry"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className={`w-full mt-1.5 p-3 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Write your message or inquiry details here..."
                    className={`w-full mt-1.5 p-3.5 rounded-xl border text-xs transition focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Support Ticket</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Prefer WhatsApp? Click Here</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
