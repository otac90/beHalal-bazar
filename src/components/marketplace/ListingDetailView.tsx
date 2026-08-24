import React, { useState, useEffect } from 'react';
import { 
  Heart, Share2, ShieldAlert, MapPin, Truck, Package, 
  ChevronLeft, ChevronRight, MessageSquare, 
  ArrowLeft, Eye 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { SellerCard } from './SellerCard';
import { SafetyBox } from './SafetyBox';
import { ReportDialog } from './ReportDialog';
import { ReviewDialog } from './ReviewDialog';
import { Listing } from '../../types';

export const ListingDetailView: React.FC = () => {
  const { routeParams, navigate, user, toggleFavorite, isFavorite, showToast, t, language } = useApp();
  const listingId = routeParams.id;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    if (listingId) {
      const found = storage.getListingById(listingId);
      if (found) {
        setListing(found);
        storage.incrementListingViews(listingId);
      }
    }
  }, [listingId]);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <h2 className="text-3xl font-serif text-[#123D2A] dark:text-white mb-4">
          Inserat nicht gefunden
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-md">
          Dieses Inserat wurde möglicherweise bereits verkauft, gelöscht oder existiert nicht.
        </p>
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D2A] text-white text-sm font-bold shadow-xs hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zum Marktplatz</span>
        </button>
      </div>
    );
  }

  const isFav = isFavorite(listing.id);
  const isOwner = user?.id === listing.userId;
  const isFree = listing.type === 'FREE' || listing.isFree;
  const isWanted = listing.type === 'WANTED';

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

  const handleStartChat = () => {
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      navigate('login');
      return;
    }
    if (isOwner) {
      showToast('Du bist der Ersteller dieses Inserats.', 'info');
      return;
    }
    const conv = storage.startConversation(listing, user);
    navigate('messages', { conversationId: conv.id });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link zum Inserat in die Zwischenablage kopiert!', 'info');
  };

  const images = listing.images.length > 0 
    ? listing.images 
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800', isCover: true, sortOrder: 0 }];

  return (
    <div className="pb-24">
      
      {/* FULL BLEED IMAGE HEADER */}
      <div className="w-full bg-[#171A17] relative aspect-square sm:aspect-video lg:aspect-[21/9] overflow-hidden">
        <img
          src={images[activeImageIndex]?.url}
          alt={listing.title}
          className="w-full h-full object-cover object-center opacity-90"
        />

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="p-3 bg-black/40 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="p-3 bg-black/40 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-bold tracking-widest">
            {activeImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-16">
        
        {/* NAV / BREADCRUMB */}
        <div className="flex justify-between items-center mb-8 border-b border-[#123D2A]/10 dark:border-white/10 pb-4">
          <button
            onClick={() => navigate('home')}
            className="text-sm font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.goBack}
          </button>
          
          <div className="flex gap-4">
            <button onClick={handleShare} className="text-sm font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:opacity-60 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Teilen
            </button>
            <button onClick={() => toggleFavorite(listing.id)} className="text-sm font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] hover:opacity-60 flex items-center gap-2">
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? 'Gemerkt' : 'Merken'}
            </button>
          </div>
        </div>

        {/* MAIN TYPOGRAPHIC LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* LEFT: INFO */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* TITLE & PRICE */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 text-xs font-bold bg-[#123D2A] text-[#F4C430] uppercase tracking-widest">
                  {isWanted ? t.typeWanted : isFree ? t.typeFree : t.typeSell}
                </span>
                {listing.status === 'RESERVED' && (
                  <span className="px-3 py-1 text-xs font-bold bg-amber-600 text-white uppercase tracking-widest">Reserviert</span>
                )}
                {listing.status === 'SOLD' && (
                  <span className="px-3 py-1 text-xs font-bold bg-[#171A17] text-white uppercase tracking-widest">Verkauft</span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#123D2A] dark:text-white leading-[1.1] mb-6">
                {listing.title}
              </h1>

              <div className="flex items-baseline gap-4">
                {isFree ? (
                  <span className="text-3xl md:text-4xl font-extrabold text-[#123D2A] dark:text-[#F4C430]">
                    {t.freePrice}
                  </span>
                ) : isWanted ? (
                  <span className="text-3xl md:text-4xl font-bold text-[#171A17] dark:text-white">
                    {listing.maxBudget ? `bis ${formatPrice(listing.maxBudget)}` : 'VB'}
                  </span>
                ) : (
                  <>
                    <span className="text-3xl md:text-4xl font-bold text-[#171A17] dark:text-white">
                      {formatPrice(listing.price)}
                    </span>
                    {listing.negotiable && (
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">VB</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="prose prose-lg dark:prose-invert prose-p:text-[#171A17]/80 dark:prose-p:text-gray-300 max-w-none font-medium">
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>

            {/* SPECIFICATIONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-[#123D2A]/10 dark:border-white/10">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Zustand</span>
                <span className="text-lg font-serif text-[#123D2A] dark:text-white">{getConditionLabel()}</span>
              </div>
              {listing.brand && (
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Marke</span>
                  <span className="text-lg font-serif text-[#123D2A] dark:text-white">{listing.brand}</span>
                </div>
              )}
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Übergabe</span>
                <span className="text-lg font-serif text-[#123D2A] dark:text-white flex items-center gap-2">
                  {listing.deliveryType === 'PICKUP' && <Package className="w-5 h-5"/>}
                  {listing.deliveryType === 'SHIPPING' && <Truck className="w-5 h-5"/>}
                  {listing.deliveryType === 'BOTH' && <><Package className="w-5 h-5"/><Truck className="w-5 h-5"/></>}
                  {listing.deliveryType === 'PICKUP' && t.deliveryPickup}
                  {listing.deliveryType === 'SHIPPING' && t.deliveryShipping}
                  {listing.deliveryType === 'BOTH' && t.deliveryBoth}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Standort</span>
                <span className="text-lg font-serif text-[#123D2A] dark:text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {listing.postalCode} {listing.city}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Aufrufe</span>
                <span className="text-lg font-serif text-[#123D2A] dark:text-white flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {listing.views}
                </span>
              </div>
            </div>

            {/* COMMUNITY DISCLAIMER (Plain text) */}
            <p className="text-sm text-gray-500 italic max-w-2xl">
              {t.marketplaceDisclaimer}
            </p>

          </div>

          {/* RIGHT: ACTION & SELLER */}
          <div className="lg:col-span-4 space-y-10">
            
            <div className="sticky top-32 space-y-10">
              {/* PRIMARY ACTION BUTTON */}
              <div>
                {!isOwner ? (
                  <button
                    id="btn-contact-seller"
                    onClick={handleStartChat}
                    className="w-full py-5 bg-[#123D2A] hover:bg-[#0D2C1E] dark:bg-white dark:text-[#171A17] dark:hover:bg-gray-200 text-white font-bold text-lg flex items-center justify-center gap-3 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{t.sendMessage}</span>
                  </button>
                ) : (
                  <div className="p-4 bg-[#CBD9C6]/20 text-[#123D2A] dark:bg-white/5 dark:text-white text-sm font-bold text-center">
                    Dies ist dein eigenes Inserat. Du kannst es in deinem Konto bearbeiten.
                  </div>
                )}
              </div>

              {/* SELLER & SAFETY (We will restyle them to be flat, but they use their own components. For now, leave them as is, they will just sit below the button) */}
              <div className="space-y-6">
                <SellerCard seller={listing.seller} />
                <SafetyBox />
              </div>

              {/* REPORT LINK */}
              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                <button
                  id="btn-report-listing"
                  onClick={() => setShowReportDialog(true)}
                  className="hover:text-red-500 flex items-center gap-2 uppercase tracking-widest"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {t.reportListing}
                </button>
                {!isOwner && listing.seller && (
                  <button
                    onClick={() => setShowReviewDialog(true)}
                    className="hover:text-[#123D2A] dark:hover:text-[#F4C430] uppercase tracking-widest"
                  >
                    Bewerten
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* DIALOGS */}
      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        reportedUserId={listing.userId}
      />
      {listing.seller && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          targetUserId={listing.seller.id}
          targetUserName={listing.seller.firstName}
        />
      )}

    </div>
  );
};
