import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, ShieldCheck, CheckCheck, Clock, ImageIcon, 
  MapPin, AlertTriangle, ArrowLeft, MoreVertical, Check, 
  Sparkles, Star 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { Conversation, Message } from '../../types';
import { ReviewDialog } from '../marketplace/ReviewDialog';

export const MessengerView: React.FC = () => {
  const { user, routeParams, navigate, showToast, t } = useApp();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    routeParams.conversationId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const userId = user?.id;

  // Initialize or synchronize conversation list and active selection
  useEffect(() => {
    if (!userId) return;
    const convs = storage.getConversations(userId);
    setConversations(convs);

    const initialId = routeParams.conversationId || (convs.length > 0 ? convs[0].id : null);
    if (!activeConversationId && initialId) {
      setActiveConversationId(initialId);
    }
  }, [userId, routeParams.conversationId]); // DO NOT ADD activeConversationId here to prevent loops

  // Load messages and mark as read when active conversation changes
  useEffect(() => {
    if (!userId || !activeConversationId) {
      setMessages([]);
      return;
    }
    const msgs = storage.getMessages(activeConversationId);
    setMessages(msgs);

    // Defer marking as read to prevent synchronously triggering storage subscriptions during effect phase
    const timeout = setTimeout(() => {
      const convs = storage.getConversations(userId);
      const targetConv = convs.find((c) => c.id === activeConversationId);
      if (targetConv && targetConv.unreadCountForUser && targetConv.unreadCountForUser > 0) {
        storage.markConversationAsRead(activeConversationId, userId);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [userId, activeConversationId]);

  // Listen to background storage updates without calling state mutators that loop
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = storage.subscribe(() => {
      const convs = storage.getConversations(userId);
      setConversations(convs);
      
      // We read activeConversationId from the current closure, but since this runs on notify, it's fine
      // However, we should prefer functional state updates or just read the latest state
      setMessages((prevMsgs) => {
        if (!activeConversationId) return prevMsgs;
        const newMsgs = storage.getMessages(activeConversationId);
        // Only update if lengths differ to avoid unnecessary renders
        if (newMsgs.length !== prevMsgs.length) return newMsgs;
        return prevMsgs;
      });
    });
    return unsubscribe;
  }, [userId, activeConversationId]);

  const prevConvId = useRef(activeConversationId);
  const prevMsgCount = useRef(messages.length);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      if (prevConvId.current === activeConversationId) {
        if (messages.length > prevMsgCount.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      } else {
        // When switching chats, do not scroll all the way down
        messagesContainerRef.current.scrollTop = 0;
      }
    }
    prevConvId.current = activeConversationId;
    prevMsgCount.current = messages.length;
  }, [messages.length, activeConversationId]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-8 animate-fade-in">
        <h2 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">
          {t.closedCommunityNotice}
        </h2>
        <p className="font-sans text-sm text-gray-500 uppercase tracking-widest leading-relaxed">
          Melde dich an oder wechsle ein Test-Profil, um deine Nachrichten einzusehen.
        </p>
        <button
          onClick={() => navigate('login')}
          className="px-8 py-4 bg-[#F4C430] text-[#123D2A] text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          {t.login}
        </button>
      </div>
    );
  }

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationId) return;

    storage.sendMessage(activeConversationId, user.id, messageText.trim());
    setMessageText('');
  };

  const handleStatusChange = (newStatus: 'RESERVED' | 'SOLD' | 'ACTIVE') => {
    if (!activeConversation) return;
    storage.updateListingStatus(activeConversation.listingId, newStatus);
    showToast(`Status auf "${newStatus}" aktualisiert.`, 'success');
  };

  const isSeller = activeConversation?.sellerId === user.id;
  const otherParticipantName = isSeller ? activeConversation?.buyerName : activeConversation?.sellerName;
  const otherParticipantAvatar = isSeller ? activeConversation?.buyerAvatar : activeConversation?.sellerAvatar;
  const otherParticipantId = isSeller ? activeConversation?.buyerId : activeConversation?.sellerId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)] min-h-[600px] flex">
      
      <div className="flex-1 border-t border-b border-gray-200 dark:border-white/10 flex overflow-hidden">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: CONVERSATION LIST */}
        {/* ==================================================== */}
        <div className={`w-full md:w-96 border-r border-gray-200 dark:border-white/10 flex flex-col ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* HEADER */}
          <div className="py-6 pr-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">
              {t.messages}
            </h2>
            <span className="font-serif font-bold text-xl text-[#123D2A] dark:text-[#F4C430]">
              {conversations.length}
            </span>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isConvSeller = conv.sellerId === user.id;
                const partnerName = isConvSeller ? conv.buyerName : conv.sellerName;
                const partnerAvatar = isConvSeller ? conv.buyerAvatar : conv.sellerAvatar;
                const isSelected = conv.id === activeConversationId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setMessages(storage.getMessages(conv.id));
                    }}
                    className={`w-full py-6 pr-6 text-left flex items-start gap-4 transition-colors border-b border-gray-100 dark:border-white/5 ${
                      isSelected
                        ? 'bg-[#CBD9C6]/20 dark:bg-[#1E5C41]/20'
                        : 'hover:bg-gray-50/30 dark:hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt=""
                      className="w-14 h-14 object-cover shrink-0 grayscale hover:grayscale-0 transition-all"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-serif font-bold text-lg text-[#171A17] dark:text-white truncate">
                          {partnerName}
                        </span>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] truncate mb-1">
                        {conv.listingTitle}
                      </p>

                      <p className="font-sans text-xs text-gray-500 truncate">
                        {conv.lastMessage || 'Noch keine Nachrichten...'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 space-y-4">
                <p className="font-serif font-bold text-xl">Noch keine Unterhaltungen vorhanden.</p>
                <p className="font-sans text-[10px] uppercase tracking-widest">Klicke bei einem Inserat auf „Nachricht schreiben“, um einen Chat zu starten.</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: ACTIVE CHAT & LISTING CONTEXT */}
        {/* ==================================================== */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full bg-transparent">
            
            {/* CHAT TOP BAR WITH LISTING CONTEXT */}
            <div className="py-6 px-6 md:px-12 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <img
                  src={activeConversation.listingImage || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=120'}
                  alt=""
                  className="w-16 h-16 object-cover shrink-0 cursor-pointer"
                  onClick={() => navigate('listing-detail', { id: activeConversation.listingId })}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 
                      onClick={() => navigate('listing-detail', { id: activeConversation.listingId })}
                      className="font-serif font-bold text-xl sm:text-2xl text-[#171A17] dark:text-white truncate cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {activeConversation.listingTitle}
                    </h3>
                    <span className="font-sans text-xs font-bold text-[#123D2A] dark:text-[#F4C430] uppercase tracking-widest mt-1">
                      {activeConversation.listingPrice === 0 ? 'Kostenlos' : `${activeConversation.listingPrice} €`}
                    </span>
                  </div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 truncate mt-1">
                    Gespräch mit <strong className="text-[#171A17] dark:text-white">{otherParticipantName}</strong>
                  </p>
                </div>
              </div>

              {/* SELLER ACTION BUTTONS */}
              {isSeller && (
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => handleStatusChange('RESERVED')}
                    className="px-4 py-2 border border-[#171A17] dark:border-white text-[#171A17] dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#171A17] hover:text-white dark:hover:bg-white dark:hover:text-[#171A17] transition-colors"
                  >
                    Reservieren
                  </button>
                  <button
                    onClick={() => handleStatusChange('SOLD')}
                    className="px-4 py-2 bg-[#F4C430] text-[#123D2A] text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    Verkauft
                  </button>
                </div>
              )}
            </div>

            {/* SAFETY NOTICE BANNER */}
            <div className="px-6 md:px-12 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430] shrink-0" />
                <span>{t.safetyBoxTips}</span>
              </div>
              <button
                onClick={() => setShowReviewDialog(true)}
                className="underline hover:text-[#171A17] dark:hover:text-white transition-colors"
              >
                Bewerten
              </button>
            </div>

            {/* MESSAGES THREAD */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-6">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[60%] p-5 text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#123D2A] text-[#F5F1E8] dark:bg-[#F4C430] dark:text-[#123D2A]'
                          : 'bg-[#F5F1E8] text-[#123D2A] dark:bg-white/5 dark:text-gray-300'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-2 flex items-center gap-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#123D2A] dark:text-[#F4C430]" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* MESSAGE INPUT BAR */}
            <form
              onSubmit={handleSendMessage}
              className="px-6 md:px-12 py-6 border-t border-gray-200 dark:border-white/10 flex items-end gap-4"
            >
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={t.typeMessagePlaceholder}
                rows={1}
                className="flex-1 py-3 bg-transparent border-b border-gray-300 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors resize-none placeholder:font-sans placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="pb-3 text-[#F4C430] hover:text-[#E4B528] disabled:opacity-30 transition-colors"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <p className="font-serif font-bold text-2xl">Wähle eine Unterhaltung aus der linken Liste aus.</p>
          </div>
        )}

      </div>

      {/* REVIEW DIALOG */}
      {otherParticipantId && otherParticipantName && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          targetUserId={otherParticipantId}
          targetUserName={otherParticipantName}
        />
      )}

    </div>
  );
};
