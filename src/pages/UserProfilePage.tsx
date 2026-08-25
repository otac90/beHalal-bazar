import React, { useState } from 'react';
import { 
  ShieldCheck, Star, Clock, MapPin, Package, 
  ArrowLeft, MessageSquare, Check, Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { ListingCard } from '../components/marketplace/ListingCard';
import { ReviewDialog } from '../components/marketplace/ReviewDialog';

export const UserProfilePage: React.FC = () => {
  const { routeParams, navigate, user, showToast, t, language } = useApp();
  const username = routeParams.username;
  
  const [showReviewDialog, setShowReviewDialog] = useState(false);

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
  const userReviews = storage.getReviewsForUser(targetUser.id);
  const isMe = user?.id === targetUser.id;

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
            src={targetUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
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

        {/* TRUST STATS & ACTION */}
        <div className="flex flex-col items-start md:items-end gap-6 shrink-0">
          <div className="text-left md:text-right">
            <div className="flex items-center justify-start md:justify-end gap-2 text-[#171A17] dark:text-white font-serif font-bold text-4xl">
              <span>{targetUser.ratingAverage}</span>
              <Star className="w-6 h-6 fill-[#123D2A] dark:fill-[#F4C430] text-[#123D2A] dark:text-[#F4C430]" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mt-2">
              {targetUser.ratingCount} {targetUser.ratingCount === 1 ? 'Bewertung' : 'Bewertungen'}
            </span>
          </div>

          {!isMe && (
            <button
              id="btn-profile-rate"
              onClick={() => setShowReviewDialog(true)}
              className="px-6 py-3 border border-[#171A17] dark:border-white text-[#171A17] dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#171A17] hover:text-white dark:hover:bg-white dark:hover:text-[#171A17] transition-colors"
            >
              Erfahrung bewerten
            </button>
          )}
        </div>

      </div>

      {/* TWO SECTIONS: ACTIVE LISTINGS & REVIEWS */}
      <div className="space-y-24">
        
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

        {/* REVIEWS SECTION */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-[#171A17] dark:text-white">
              Community-Bewertungen
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {userReviews.length} {userReviews.length === 1 ? 'Bewertung' : 'Bewertungen'}
            </span>
          </div>

          {userReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {userReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="pb-8 border-b border-gray-200 dark:border-white/10 space-y-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={rev.reviewerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                          alt=""
                          className="w-12 h-12 rounded-none object-cover grayscale"
                        />
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-[#171A17] dark:text-white">
                            {rev.reviewerName}
                          </h4>
                          <span className="text-[10px] font-sans text-gray-400">
                            {new Date(rev.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'de-AT')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-[#171A17] text-[#171A17] dark:fill-white dark:text-white' : 'text-gray-300 dark:text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rev.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-[#171A17] dark:text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rev.comment && (
                      <p className="text-sm font-serif font-bold italic text-[#171A17]/80 dark:text-gray-300">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 border-t border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
              Noch keine Bewertungen abgegeben.
            </div>
          )}
        </div>

      </div>

      {/* REVIEW DIALOG */}
      <ReviewDialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        targetUserId={targetUser.id}
        targetUserName={targetUser.firstName}
      />

    </div>
  );
};
