import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, ShieldCheck, AlertTriangle, MessageSquare, Loader2, Lock } from 'lucide-react';
import { Business, ChatConversation, ChatMessage, User as UserType } from '../types';
import {
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
  subscribeToMessages,
} from '../lib/supabaseDB';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Customer → business chat (creates/fetches a conversation). */
  business?: Business | null;
  /** Owner dashboard → customer conversation (existing conversation). */
  conversation?: ChatConversation | null;
  currentUser: UserType | null;
  isDarkMode?: boolean;
}

/**
 * Real chat backed by Supabase tables + Realtime:
 *  - conversations & messages rows persist across sessions
 *  - no fake auto-replies, no simulated messages
 *  - business owners reply from their dashboard conversations inbox
 */
export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  business = null,
  conversation = null,
  currentUser,
  isDarkMode = true
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOffPlatformWarning, setShowOffPlatformWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const title = conversation
    ? conversation.customerName // owner replying to a customer
    : business?.name || 'Chat';

  const subtitle = conversation
    ? `Customer inquiry for ${conversation.businessName}`
    : business
    ? `${business.city} • Live chat`
    : '';

  // --------------------------------------------------
  // OPEN: resolve conversation + fetch history + subscribe realtime
  // --------------------------------------------------
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    let unsubscribe: (() => void) | null = null;
    let active = true;

    const setup = async () => {
      setLoading(true);
      setError(null);
      setMessages([]);

      let convId: string | null = null;

      if (conversation) {
        convId = conversation.id;
      } else if (business) {
        const res = await getOrCreateConversation(business.id);
        if (res.error) {
          if (active) {
            setError(res.error);
            setLoading(false);
          }
          return;
        }
        convId = res.data;
      }

      if (!active || !convId) {
        if (active) setLoading(false);
        return;
      }

      setConversationId(convId);

      const { data: history, error: historyError } = await fetchMessages(convId);
      if (active) {
        if (historyError) setError(historyError);
        setMessages(history || []);
        setLoading(false);
      }

      // Realtime: append new messages (deduping our own optimistic echoes)
      unsubscribe = subscribeToMessages(convId, (msg) => {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      });
    };

    void setup();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
      setConversationId(null);
    };
  }, [isOpen, business, conversation, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  // --------------------------------------------------
  // SEND
  // --------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !conversationId || sending) return;

    // Off-platform safety heuristic (contact info sharing)
    const phoneRegex = /(?:\+92|03\d{2})[ -]?\d{7}/g;
    const offPlatformKeywords = ['whatsapp', 'call me', 'direct transfer', 'easypaisa account', 'jazzcash account'];
    const hasContactInfo =
      phoneRegex.test(text) || offPlatformKeywords.some((k) => text.toLowerCase().includes(k));
    if (hasContactInfo) setShowOffPlatformWarning(true);

    setSending(true);
    const { data, error } = await sendMessage(conversationId, text);
    setSending(false);

    if (error) {
      setError(error);
      return;
    }

    if (data) {
      // Local echo (realtime may also deliver it — dedupe by id)
      setMessages((prev) =>
        prev.some((m) => m.id === data.id)
          ? prev
          : [
              ...prev,
              {
                ...data,
                senderName: currentUser?.name || 'You',
                containsContactInfo: hasContactInfo,
              },
            ]
      );
    }
    setInputText('');
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
            {(conversation?.businessLogo || business?.logoImage) ? (
              <img
                src={conversation?.businessLogo || business?.logoImage}
                alt={title}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight">{title}</h3>
                {(business?.isVerified) && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
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

        {/* Safety banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-4 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="font-bold block text-amber-600 dark:text-amber-400">Buyer Protection Policy Alert:</strong>
            Communicating or paying outside BizNest (private calls, WhatsApp, or direct bank transfers) is strictly at your own risk. Please keep all orders on BizNest.
          </div>
        </div>

        {/* LOGIN REQUIRED */}
        {!currentUser && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Lock className="w-10 h-10 text-slate-500" />
            <p className="text-sm font-bold">Login required to chat</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Conversations are saved to your account so merchants can reply to you — please log in first.
            </p>
          </div>
        )}

        {/* LOADING */}
        {currentUser && loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          </div>
        )}

        {/* MESSAGES */}
        {currentUser && !loading && (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {messages.length === 0 && !error && (
              <div className="text-center py-10 text-slate-500 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-bold">No messages yet.</p>
                <p className="text-xs max-w-xs mx-auto">
                  Send the first message — the {conversation ? 'customer' : 'business'} will see it in their inbox.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    isMine
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                  }`}>
                    <div className="font-bold text-[10px] opacity-80 mb-0.5 flex items-center justify-between gap-2">
                      <span>{isMine ? 'You' : msg.senderName || title}</span>
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
        )}

        {/* Quick Suggestions */}
        {currentUser && !loading && (
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
        )}

        {/* Input Bar */}
        {currentUser && !loading && (
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Message ${title}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition cursor-pointer"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
