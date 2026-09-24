import React from 'react';
import { 
  ShieldCheck, ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { ListingCard } from '../components/marketplace/ListingCard';

export const UserProfilePage: React.FC = () => {
  const { routeParams, navigate, t } = useApp();
  const username = routeParams.username;
  
  // Find user by username
  const targetUser = storage.getUserByUsername(username || '');

  if (!targetUser) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-8 animate-fade-in">
        <h2 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">
          Mitglied nicht gefunden
        </h2>
        <p className="font-sans text-xs uppercase tracking-widest text-gray-500 leading-relaxed">
          Dieses Mitglied existiert leider nicht oder das Profil wurde deaktiviert.
        </p>
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </button>
      </div>
    );
  }

  const userListings = storage.getListingsByUserId(targetUser.id).filter((l) => l.status === 'ACTIVE');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      
      {/* NAV */}
      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#171A17] dark:text-white hover:text-[#123D2A] dark:hover:text-[#F4C430] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.goBack}</span>
      </button>

      {/* USER PROFILE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 pb-16 border-b border-gray-200 dark:border-white/10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <img
            src={targetUser.avatarUrl || '/assets/default-avatar.svg'}
            alt={targetUser.firstName}
            className="w-32 h-32 object-cover rounded-none grayscale"
          />
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#171A17] dark:text-white mb-2">
                {targetUser.firstName} {targetUser.lastName.charAt(0)}.
              </h1>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                <span>@{targetUser.username}</span>
                <span>•</span>
                <span>{targetUser.postalCode} {targetUser.city}, {targetUser.country}</span>
                {targetUser.emailVerified && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#123D2A] dark:text-[#F4C430]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verifiziert
                    </span>
                  </>
                )}
              </div>
            </div>

            {targetUser.bio && (
              <p className="text-sm font-medium text-[#171A17]/80 dark:text-gray-300 leading-relaxed max-w-2xl">
                {targetUser.bio}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ACTIVE LISTINGS */}
      <div>
        
        {/* ACTIVE LISTINGS */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-[#171A17] dark:text-white">
              Aktive Inserate
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {userListings.length} {userListings.length === 1 ? 'Inserat' : 'Inserate'}
            </span>
          </div>

          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {userListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="py-12 border-t border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
              Aktuell keine weiteren aktiven Inserate online.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
