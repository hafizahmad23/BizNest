import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, ShieldCheck, Phone, AlertTriangle, Building2, Sparkles, MessageSquare, Check, User } from 'lucide-react';
import { Business, ChatMessage, User as UserType } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  currentUser: UserType | null;
  isDarkMode?: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  business,
  currentUser,
  isDarkMode = true
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showOffPlatformWarning, setShowOffPlatformWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (business && isOpen) {
      // Initialize with welcome message from merchant
      setMessages([
        {
          id: 'msg-system-policy',
          senderId: 'system',
          senderName: 'BizNest Security',
          senderRole: 'system',
          text: '🛡️ BizNest Safety Notice: Keep all communications and payments inside BizNest. Off-platform transactions (via personal WhatsApp, private calls, or direct external transfers) are NOT covered by BizNest Buyer Protection and carry zero platform liability.',
          timestamp: 'Just now'
        },
        {
          id: 'msg-1',
          senderId: business.id,
          senderName: business.name,
          senderRole: 'merchant',
          text: `Assalamu Alaikum! Welcome to ${business.name}. How can we assist you today regarding our products, pricing, or delivery?`,
          timestamp: 'Just now'
        }
      ]);
    }
  }, [business, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !business) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Check if message contains contact info (phone numbers, WhatsApp keywords, or bank details)
    const phoneRegex = /(?:\+92|03\d{2})[ -]?\d{7}/g;
    const offPlatformKeywords = ['whatsapp', 'call me', '0300', '0321', '0333', '0312', 'direct transfer', 'easypaisa account', 'jazzcash account'];
    const hasContactInfo = phoneRegex.test(text) || offPlatformKeywords.some(k => text.toLowerCase().includes(k));

    if (hasContactInfo) {
      setShowOffPlatformWarning(true);
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'customer-1',
      senderName: currentUser?.name || 'Customer',
      senderRole: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      containsContactInfo: hasContactInfo
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate Merchant Auto-Reply
    setTimeout(() => {
      let replyText = `Thank you for your message regarding ${business.name}! Our representative is checking details for you.`;

      if (text.toLowerCase().includes('stock') || text.toLowerCase().includes('available')) {
        replyText = `Yes! All items listed in our catalog are currently in stock and ready for immediate dispatch from ${business.city}.`;
      } else if (text.toLowerCase().includes('delivery') || text.toLowerCase().includes('shipping')) {
        replyText = `We deliver across Pakistan via Leopard/TCS courier. Delivery typically takes 24–48 hours to major cities.`;
      } else if (text.toLowerCase().includes('discount') || text.toLowerCase().includes('price')) {
        replyText = `Our prices listed on BizNest are transparent factory/direct rates. For bulk orders over PKR 50,000, we offer a 5% instant rebate in checkout!`;
      } else if (hasContactInfo) {
        replyText = `Thank you! Please note that for your financial safety, we strongly recommend placing all orders and payments directly through BizNest checkout.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          senderId: business.id,
          senderName: business.name,
          senderRole: 'merchant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const quickPrompts = [
    'Is this item available in stock?',
    'What is the estimated delivery time?',
    'Can I place a custom order?',
    'Do you offer cash on delivery?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl relative transition-all h-[85vh] flex flex-col ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <img src={business.logoImage} alt={business.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight">{business.name}</h3>
                {business.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{business.city} • Replies in {business.responseTime}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OFF-PLATFORM TRANSACTIONS SAFETY WARNING BANNER */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-4 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="font-bold block text-amber-600 dark:text-amber-400">Buyer Protection Policy Alert:</strong>
            Communicating or paying outside BizNest (e.g., private phone calls, WhatsApp, or direct bank transfers) is strictly at your own risk. BizNest assumes zero responsibility or liability for off-platform losses. Please keep all orders on BizNest.
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            if (msg.senderRole === 'system') {
              return (
                <div key={msg.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center max-w-md mx-auto my-2">
                  {msg.text}
                </div>
              );
            }

            const isCustomer = msg.senderRole === 'customer';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                  isCustomer
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                }`}>
                  <div className="font-bold text-[10px] opacity-80 mb-0.5 flex items-center justify-between gap-2">
                    <span>{msg.senderName}</span>
                    <span className="text-[9px] opacity-70">{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>

                {msg.containsContactInfo && (
                  <div className="mt-1 text-[10px] text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Contact info detected: Keep payments on-platform for safety.</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 shrink-0 font-bold text-[10px] uppercase">Quick Ask:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className={`px-3 py-1 rounded-full border shrink-0 transition text-[10px] font-semibold ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask ${business.name} a question...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
