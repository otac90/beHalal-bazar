import React from 'react';
import { Heart, Truck, Package } from 'lucide-react';
import { Listing } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  listing: Listing;
}

export const ListingCard: React.FC<Props> = ({ listing }) => {
  const { navigate, toggleFavorite, isFavorite, t, language } = useApp();

  const isFav = isFavorite(listing.id);
  const coverImage = listing.images.find((i) => i.isCover)?.url || listing.images[0]?.url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  };

  const getConditionLabel = () => {
    switch (listing.condition) {
      case 'NEW': return t.conditionNew;
      case 'LIKE_NEW': return t.conditionLikeNew;
      case 'VERY_GOOD': return t.conditionVeryGood;
      case 'GOOD': return t.conditionGood;
      case 'USED': return t.conditionUsed;
      case 'DEFECTIVE': return t.conditionDefective;
      default: return '';
    }
  };

  const isWanted = listing.type === 'WANTED';
  const isFree = listing.type === 'FREE' || listing.isFree;
  const isReserved = listing.status === 'RESERVED';
  const isSold = listing.status === 'SOLD';

  const dateObj = new Date(listing.createdAt);
  const isNew = Date.now() - dateObj.getTime() < 48 * 60 * 60 * 1000; // 48h for demo
  const dateString = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'de-AT', { day: '2-digit', month: 'short' });

  return (
    <div
      id={`listing-card-${listing.id}`}
      onClick={() => navigate('listing-detail', { id: listing.id })}
      className="group relative flex flex-col cursor-pointer"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full bg-gray-100 dark:bg-black/20 overflow-hidden">
        <img
          src={coverImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        />

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F4C430] text-[#123D2A] uppercase tracking-widest">
              NEU
            </span>
          )}
          {isFree && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123D2A] text-[#F5F1E8] uppercase tracking-widest">
              {t.typeFree}
            </span>
          )}
          {isWanted && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123D2A] text-[#F4C430] uppercase tracking-widest">
              {t.typeWanted}
            </span>
          )}
          {isReserved && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white uppercase tracking-widest">
              Reserviert
            </span>
          )}
          {isSold && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-900 text-white uppercase tracking-widest">
              Verkauft
            </span>
          )}
        </div>

        {/* FAVORITE BUTTON */}
        <button
          id={`btn-fav-${listing.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          className={`absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm border border-[#123D2A]/10 dark:border-white/10 transition-transform active:scale-90 z-10`}
          title={isFav ? t.favoriteRemoved : t.favoriteAdded}
          aria-label="Add to favorite"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-[#123D2A] dark:text-white hover:text-red-500 transition-colors'}`} />
        </button>

        {/* DELIVERY ICON */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 drop-shadow-md">
          {listing.deliveryType === 'SHIPPING' && (
            <Truck className="w-4 h-4 text-white" />
          )}
          {listing.deliveryType === 'PICKUP' && (
            <Package className="w-4 h-4 text-white" />
          )}
          {listing.deliveryType === 'BOTH' && (
            <div className="flex -space-x-1">
              <Truck className="w-4 h-4 text-white" />
              <Package className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* CONTENT (Outside Image) */}
      <div className="pt-3 flex flex-col gap-1">
        
        {/* PRICE & CONDITION */}
        <div className="flex items-center gap-2">
          {isFree ? (
            <span className="text-sm font-extrabold text-[#123D2A] dark:text-[#F4C430]">
              {t.freePrice}
            </span>
          ) : isWanted ? (
            <span className="text-sm font-bold text-[#123D2A] dark:text-[#F4C430]">
              {listing.maxBudget ? `bis ${formatPrice(listing.maxBudget)}` : 'VB'}
            </span>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-[#123D2A] dark:text-[#F4C430]">
                {formatPrice(listing.price)}
              </span>
              {listing.negotiable && (
                <span className="text-[10px] font-bold text-gray-500 uppercase">VB</span>
              )}
            </div>
          )}
        </div>

        {/* TITLE */}
        <h3 className="text-[15px] font-medium text-[#171A17] dark:text-white line-clamp-1 leading-snug">
          {listing.title}
        </h3>

        {/* LOCATION & DATE */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 gap-1 truncate">
          <span>{listing.city}</span>
          <span className="opacity-50">·</span>
          <span>{dateString}</span>
          <span className="opacity-50">·</span>
          <span>{getConditionLabel()}</span>
        </div>

      </div>
    </div>
  );
};
