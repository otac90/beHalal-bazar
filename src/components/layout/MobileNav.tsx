import React from 'react';
import { Home, Search, Plus, MessageSquare, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { currentRoute, navigate, user, unreadMessagesCount } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121A14]/90 backdrop-blur-lg border-t border-gray-200/80 dark:border-white/10 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* START */}
        <button
          id="btn-mobile-nav-home"
          onClick={() => navigate('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentRoute === 'home'
              ? 'text-[#123D2A] dark:text-[#F5C518] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Start</span>
        </button>

        {/* SUCHEN */}
        <button
          id="btn-mobile-nav-search"
          onClick={() => navigate('search')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentRoute === 'search'
              ? 'text-[#123D2A] dark:text-[#F5C518] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Suchen</span>
        </button>

        {/* INSERIEREN (PROMINENT CENTER BUTTON) */}
        <button
          id="btn-mobile-nav-post"
          onClick={() => navigate('create-listing')}
          className="flex flex-col items-center justify-center -mt-5"
          aria-label="Inserat aufgeben"
        >
          <div className="w-12 h-12 rounded-full bg-[#F5C518] text-[#123D2A] flex items-center justify-center shadow-lg active:scale-95 transition-transform border-2 border-white dark:border-[#121A14]">
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </div>
          <span className="text-[10px] font-bold text-[#123D2A] dark:text-[#F5C518] mt-0.5">
            Inserieren
          </span>
        </button>

        {/* NACHRICHTEN */}
        <button
          id="btn-mobile-nav-messages"
          onClick={() => navigate('messages')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors relative ${
            currentRoute === 'messages'
              ? 'text-[#123D2A] dark:text-[#F5C518] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-1 flex items-center justify-center min-w-[16px] h-[16px] bg-red-600 text-white rounded-full text-[9px] font-bold ring-2 ring-white dark:ring-[#121A14]">
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        {/* KONTO */}
        <button
          id="btn-mobile-nav-account"
          onClick={() => navigate(user ? 'account' : 'login')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            currentRoute === 'account' || currentRoute === 'login'
              ? 'text-[#123D2A] dark:text-[#F5C518] font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{user ? 'Konto' : 'Login'}</span>
        </button>

      </div>
    </div>
  );
};
