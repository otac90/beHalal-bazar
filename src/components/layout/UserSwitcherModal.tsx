import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, UserCheck, ShieldAlert, LogOut, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';

export const UserSwitcherModal: React.FC = () => {
  const { showUserSwitcher, setShowUserSwitcher, user, switchUser, t } = useApp();
  const allUsers = storage.getUsers();

  if (!showUserSwitcher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="bg-white dark:bg-[#111511] max-w-md w-full p-6 sm:p-8 border border-[#171A17] dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-white/10">
          <div>
            <h3 className="text-2xl font-serif text-[#171A17] dark:text-white">
              {t.switchUserDemo}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
              Teste unterschiedliche Rollen & Perspektiven
            </p>
          </div>
          <button
            id="btn-close-user-switcher"
            onClick={() => setShowUserSwitcher(false)}
            className="p-2 border border-transparent hover:border-[#171A17] dark:hover:border-white/30 text-gray-400 hover:text-[#171A17] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {allUsers.map((u) => {
            const isSelected = user?.id === u.id;
            const isAdmin = u.role === 'ADMIN';
            const isMod = u.role === 'MODERATOR';

            return (
              <button
                key={u.id}
                id={`switch-to-${u.username}`}
                onClick={() => {
                  switchUser(u.id);
                  setShowUserSwitcher(false);
                }}
                className={`w-full flex items-center justify-between p-4 border text-left transition-all ${
                  isSelected
                    ? 'border-[#171A17] dark:border-white bg-gray-50 dark:bg-white/5'
                    : 'border-gray-200 dark:border-white/10 hover:border-[#171A17] dark:hover:border-white/50 bg-white dark:bg-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={u.firstName}
                    className="w-12 h-12 object-cover border border-[#171A17]/10 dark:border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#171A17] dark:text-white text-sm">
                        {u.firstName} {u.lastName}
                      </span>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#171A17] text-white dark:bg-white dark:text-[#171A17]">
                          <ShieldAlert className="w-3 h-3" /> ADMIN
                        </span>
                      )}
                      {isMod && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-[#171A17] text-[#171A17] dark:border-white dark:text-white">
                          <ShieldCheck className="w-3 h-3" /> MOD
                        </span>
                      )}
                      {!isAdmin && !isMod && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-gray-300 text-gray-500 dark:border-white/30 dark:text-gray-400">
                          <UserCheck className="w-3 h-3" /> USER
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                      @{u.username} • {u.city} • ★ {u.ratingAverage} ({u.ratingCount})
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 border border-[#171A17] dark:border-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-[#171A17] dark:text-white" />
                  </div>
                )}
              </button>
            );
          })}

          <button
            id="switch-to-guest"
            onClick={() => {
              switchUser(null);
              setShowUserSwitcher(false);
            }}
            className={`w-full flex items-center justify-between p-4 border text-left transition-all ${
              user === null
                ? 'border-[#171A17] dark:border-white bg-gray-50 dark:bg-white/5'
                : 'border-gray-200 dark:border-white/10 hover:border-[#171A17] dark:hover:border-white/50 bg-white dark:bg-transparent'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#171A17] dark:text-white text-sm block mb-1">
                  {t.guestView}
                </span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
                  Öffentliche Ansicht
                </p>
              </div>
            </div>
            {user === null && (
              <div className="w-6 h-6 border border-[#171A17] dark:border-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-[#171A17] dark:text-white" />
              </div>
            )}
          </button>
        </div>

        <div className="mt-8">
          <button
            id="btn-close-switcher-bottom"
            onClick={() => setShowUserSwitcher(false)}
            className="w-full py-4 bg-[#171A17] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#123D2A] dark:hover:bg-gray-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

