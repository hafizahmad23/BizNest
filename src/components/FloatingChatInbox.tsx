import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, MessageSquare, ChevronLeft, Loader2 } from 'lucide-react';
import { ChatConversation, User as UserType, ChatMessage } from '../types';
import { fetchUserConversations, subscribeToUserMessages, markMessagesRead, fetchMessages, sendMessage } from '../lib/supabaseDB';
import { ChatModal } from './ChatModal';

interface FloatingChatInboxProps {
  currentUser: UserType | null;
  isDarkMode: boolean;
  onRequireAuth: () => void;
}

export const FloatingChatInbox: React.FC<FloatingChatInboxProps> = ({
  currentUser,
  isDarkMode,
  onRequireAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations once when opened or on mount for unread counts
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }
    let active = true;
    const load = async () => {
      const res = await fetchUserConversations();
      if (active && res.data) {
        setConversations(res.data);
      }
    };
    void load();
    return () => { active = false; };
  }, [currentUser]);

  // Subscriptions
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserMessages((msg) => {
      setConversations((prev) => {
        const idx = prev.findIndex(c => c.id === msg.conversationId);
        if (idx === -1) return prev;
        const conv = prev[idx];
        const isFromOther = msg.senderId !== currentUser.id;
        // Bump conversation up and update lastMessage / unreadCount
        const updatedConv = {
          ...conv,
          lastMessage: msg.text,
          lastUpdated: new Date().toISOString(),
          unreadCount: (isFromOther && activeConversationId !== msg.conversationId) ? conv.unreadCount + 1 : conv.unreadCount,
        };
        const newList = [updatedConv, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        return newList;
      });

      // Update active thread if it's the current one
      if (activeConversationId === msg.conversationId) {
         setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
         });
         if (msg.senderId !== currentUser.id) {
           void markMessagesRead(msg.conversationId);
         }
      }
    });

    return () => unsub();
  }, [currentUser, activeConversationId]);

  // Load messages when conversation opened
  useEffect(() => {
    if (!activeConversationId || !currentUser) return;
    let active = true;
    setLoading(true);
    const loadMsgs = async () => {
      const res = await fetchMessages(activeConversationId);
      if (active) {
        setMessages(res.data || []);
        setLoading(false);
        // Mark as read
        void markMessagesRead(activeConversationId);
        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, unreadCount: 0 } : c));
      }
    };
    void loadMsgs();
    return () => { active = false; };
  }, [activeConversationId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveConversationId(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || sending || !currentUser) return;
    setSending(true);
    const res = await sendMessage(activeConversationId, inputText.trim());
    setSending(false);
    if (res.data) {
       setMessages(prev => prev.some(m => m.id === res.data.id) ? prev : [...prev, { ...res.data, senderName: currentUser.name || 'You' }]);
       setInputText('');
    }
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // ... (button and ui rendering)
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-40 p-3 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Overlay/Panel */}
      {isOpen && currentUser && createPortal(
        <div className="fixed inset-0 md:inset-auto md:bottom-20 md:right-4 z-[45] flex items-end justify-center pointer-events-none sm:pointer-events-auto">
          {/* Mobile backdrop */}
          <div className="absolute inset-0 bg-black/60 md:hidden pointer-events-auto" onClick={handleClose} />
          
          {/* Panel */}
          <div className={`relative w-full h-[85vh] md:h-auto md:max-h-[70vh] md:w-96 flex flex-col pointer-events-auto transition-transform ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          } rounded-t-3xl md:rounded-3xl border shadow-2xl overflow-hidden`}>
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              {activeConversationId ? (
                <button onClick={() => setActiveConversationId(null)} className="flex items-center gap-1 text-sm font-bold hover:opacity-70 transition">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              ) : (
                <h3 className="font-bold">Messages</h3>
              )}
              <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto relative flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
              {activeConversationId ? (
                // Thread View
                <>
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10 opacity-50">No messages yet.</div>
                    ) : (
                      messages.map(msg => {
                        const isMine = msg.senderId === currentUser.id;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                              isMine ? 'bg-emerald-600 text-white rounded-br-none' : (isDarkMode ? 'bg-slate-800 text-slate-100 rounded-bl-none' : 'bg-slate-200 text-slate-900 rounded-bl-none')
                            }`}>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 px-3 py-2 rounded-xl border text-sm ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-emerald-500' : 'bg-slate-100 border-slate-200 focus:border-emerald-500'
                        } focus:outline-none`}
                      />
                      <button disabled={!inputText.trim() || sending} type="submit" className="p-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                // List View
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        {currentUser.role === 'business' ? 'Customer messages will appear here' : 'No conversations yet — open any business and tap Chat'}
                      </p>
                    </div>
                  ) : (
                    conversations.map(c => {
                      const isCustomer = c.customerId === currentUser.id;
                      const title = isCustomer ? c.businessName : c.customerName;
                      const logo = isCustomer ? c.businessLogo : null;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setActiveConversationId(c.id)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left ${
                            c.unreadCount > 0 ? (isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50') : ''
                          }`}
                        >
                          {logo ? (
                            <img src={logo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 font-bold">
                              {title.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className={`font-bold text-sm truncate ${c.unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                {title}
                              </h4>
                              {c.unreadCount > 0 && (
                                <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  {c.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs truncate ${c.unreadCount > 0 ? (isDarkMode ? 'text-slate-300 font-semibold' : 'text-slate-700 font-semibold') : 'text-slate-500'}`}>
                              {c.lastMessage || 'No messages'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
