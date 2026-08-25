import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { ListingGrid, SortOption } from '../components/marketplace/ListingGrid';
import { Heart } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { favorites, navigate, user, t } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Read all listings
  const allListings = storage.getListings();

  // Filter listings by favorites
  const favoriteListings = useMemo(() => {
    return allListings.filter(item => favorites.includes(item.id)).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.views + b.favoritesCount * 3) - (a.views + a.favoritesCount * 3);
      return 0;
    });
  }, [allListings, favorites, sortBy]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-serif font-bold text-[#171A17] dark:text-white mb-6">{t.pleaseLogin}</h2>
        <p className="text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">
          {t.loginToSaveFavorites}
        </p>
        <button 
          onClick={() => navigate('login')}
          className="px-8 py-4 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[10px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors inline-block"
        >
          {t.toLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* HEADER SECTION */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 bg-[#F5F1E8] dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] flex items-center gap-3">
              <Heart className="w-4 h-4" />
              {t.savedListings}
            </span>
            <h1 className="text-[3rem] sm:text-[4rem] leading-[0.95] font-serif font-bold text-[#171A17] dark:text-white tracking-tight">
              {t.my} <span className="text-[#F4C430] italic">{t.favorites}</span>
            </h1>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed mt-4">
              {t.favoritesSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* LISTINGS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        {favoriteListings.length === 0 ? (
          <div className="text-center py-32 border border-[#171A17]/10 dark:border-white/10">
            <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-8" />
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#171A17] dark:text-white mb-4">{t.noFavoritesYet}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-12">
              {t.noFavoritesDesc}
            </p>
            <button 
              onClick={() => navigate('home')}
              className="px-8 py-4 border border-[#171A17] dark:border-white/20 text-[#171A17] dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors inline-block"
            >
              {t.discoverListings}
            </button>
          </div>
        ) : (
          <ListingGrid
            listings={favoriteListings}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}
      </main>
    </div>
  );
};
