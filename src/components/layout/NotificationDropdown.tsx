import React from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCheck, MessageSquare, Search, Star, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, navigate, t } = useApp();

  if (!isOpen || !user) return null;

  const notifications = storage.getNotifications(user.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-[#171A17] dark:text-white" />;
      case 'SAVED_SEARCH_HIT':
        return <Search className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430]" />;
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-[#171A17] dark:text-white" />;
      case 'SYSTEM_ALERT':
        return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#171A17] dark:text-white" />;
    }
  };

  const handleItemClick = (notif: typeof notifications[0]) => {
    storage.markNotificationRead(notif.id);
    onClose();
    if (notif.link) {
      if (notif.link.startsWith('/nachrichten')) {
        navigate('messages');
      } else if (notif.link.startsWith('/anzeige/')) {
        const id = notif.link.split('/anzeige/')[1];
        navigate('listing-detail', { id });
      }
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => storage.markNotificationRead(n.id));
  };

  return (
    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white dark:bg-[#111511] border border-[#171A17] dark:border-white/20 z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#171A17] dark:border-white/20">
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-[#171A17] dark:text-white" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
            {t.notifications}
          </span>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            id="btn-mark-all-read"
            onClick={handleMarkAllRead}
            className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-[#171A17] dark:hover:text-white transition-colors flex items-center gap-1 font-bold"
          >
            <CheckCheck className="w-3 h-3" />
            {t.markAllRead}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {t.noNewNotifications}
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`w-full text-left p-4 flex items-start gap-4 border-b border-gray-200 dark:border-white/10 last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                !n.read ? 'bg-gray-50/50 dark:bg-white/5' : ''
              }`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${!n.read ? 'font-bold text-[#171A17] dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 bg-[#123D2A] dark:bg-[#F4C430] shrink-0" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {n.message}
                </p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-3 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
