import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Share2, X, ShieldAlert, MapPin, Truck, Package, 
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
  const [currentStatus, setCurrentStatus] = useState(listing?.status);

  const [isFullscreen, setIsFullscreen] = useState(false);


  const handleStatusChange = (newStatus: 'ACTIVE' | 'RESERVED' | 'SOLD') => {
    setCurrentStatus(newStatus);
    listing.status = newStatus;
    // Typically we'd update this in the backend/storage here.
    showToast('Status aktualisiert auf ' + newStatus, 'success');
  };
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  
  const createdAtDate = new Date(listing?.createdAt || Date.now());
  const updatedAtDate = new Date(listing?.updatedAt || Date.now());
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAtDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const images = listing?.images?.length > 0 
    ? listing.images 
    : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800', isCover: true, sortOrder: 0 }];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen || !listing?.images || listing?.images?.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images]);


  useEffect(() => {
    if (listingId) {
      const found = storage.getListingById(listingId);
      if (found) {
        setListing(found);
        setCurrentStatus(found.status);
        storage.incrementListingViews(listingId);
      }
    }
  }, [listingId]);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <h2 className="text-3xl font-serif font-bold text-[#123D2A] dark:text-white mb-4">
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

  
  

  return (
    <div className="pb-24">
      
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">
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
            
            
            {/* IMAGE GALLERY */}
            <div className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsFullscreen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsFullscreen(true);
                  }
                }}
                className="w-full relative aspect-video bg-[#F5F1E8] dark:bg-[#111511] overflow-hidden border border-[#123D2A]/10 dark:border-white/10 group cursor-zoom-in"
                aria-label="Bild in Vollbildansicht öffnen"
              >
                <img
                  src={images[activeImageIndex]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="p-3 bg-[#123D2A] text-[#F4C430] hover:bg-[#F4C430] hover:text-[#123D2A] transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="p-3 bg-[#123D2A] text-[#F4C430] hover:bg-[#F4C430] hover:text-[#123D2A] transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#123D2A] text-[#F4C430] text-[10px] font-bold tracking-widest">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
              {/* THUMBNAILS */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 shrink-0 border-2 transition-colors ${activeImageIndex === idx ? 'border-[#F4C430]' : 'border-transparent hover:border-[#123D2A]/30'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="prose prose-lg dark:prose-invert prose-p:text-[#171A17]/80 dark:prose-p:text-gray-300 max-w-none font-medium">
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>

            {/* SPECIFICATIONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-[#123D2A]/10 dark:border-white/10">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Zustand</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{getConditionLabel()}</span>
              </div>
              {listing.brand && (
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Marke</span>
                  <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{listing.brand}</span>
                </div>
              )}
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Übergabe</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white flex items-center gap-2">
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
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {listing.postalCode} {listing.city}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Aufrufe</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {listing.views}
                </span>
              </div>
            
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Erstellt am</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{formatDate(createdAtDate)}</span>
                <span className="block text-xs text-gray-500 mt-0.5">Vor {diffDays} {diffDays === 1 ? 'Tag' : 'Tagen'}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Zuletzt geändert</span>
                <span className="text-lg font-serif font-bold text-[#123D2A] dark:text-white">{formatDate(updatedAtDate)}</span>
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
              
              {/* OWNER CONTROLS */}
              {isOwner && (
                <div className="bg-white dark:bg-[#161E18] p-5 border border-[#123D2A]/10 dark:border-white/10">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Inserat-Status verwalten</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStatusChange('ACTIVE')}
                      className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${currentStatus === 'ACTIVE' ? 'bg-[#123D2A] text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}`}
                    >
                      Aktiv
                    </button>
                    <button
                      onClick={() => handleStatusChange('RESERVED')}
                      className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${currentStatus === 'RESERVED' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}`}
                    >
                      Als Reserviert markieren
                    </button>
                    <button
                      onClick={() => handleStatusChange('SOLD')}
                      className={`py-2.5 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${currentStatus === 'SOLD' ? 'bg-[#171A17] text-white' : 'bg-gray-100 dark:bg-white/5 text-[#123D2A] dark:text-white hover:bg-gray-200'}`}
                    >
                      Als Verkauft markieren
                    </button>
                  </div>
                </div>
              )}

              {/* PRIMARY ACTION BUTTON */}
              <div>
                {!isOwner ? (
                  <button
                    id="btn-contact-seller"
                    onClick={handleStartChat}
                    className="w-full py-5 bg-[#F4C430] hover:bg-[#E4B528] text-[#123D2A] font-bold text-lg flex items-center justify-center gap-3 transition-colors"
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

              
              {/* TITLE & PRICE TILE (Moved to right column) */}
              <div className="bg-[#F5F1E8] dark:bg-[#111511] p-6 border border-[#123D2A]/10 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123D2A] text-[#F4C430] uppercase tracking-widest">
                    {isWanted ? t.typeWanted : isFree ? t.typeFree : t.typeSell}
                  </span>
                  {currentStatus === 'RESERVED' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white uppercase tracking-widest">Reserviert</span>
                  )}
                  {currentStatus === 'SOLD' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#171A17] text-white uppercase tracking-widest">Verkauft</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#123D2A] dark:text-white leading-[1.1] mb-4">
                  {listing.title}
                </h1>
                <div className="flex items-baseline gap-3">
                  {isFree ? (
                    <span className="text-3xl font-extrabold text-[#123D2A] dark:text-[#F4C430]">
                      {t.freePrice}
                    </span>
                  ) : isWanted ? (
                    <span className="text-3xl font-bold text-[#123D2A] dark:text-[#F4C430]">
                      {listing.maxBudget ? `bis ${formatPrice(listing.maxBudget)}` : 'VB'}
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-[#123D2A] dark:text-[#F4C430]">
                        {formatPrice(listing.price)}
                      </span>
                      {listing.negotiable && (
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">VB</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* SELLER & SAFETY */}
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
      
      {/* FULLSCREEN GALLERY */}
      <AnimatePresence>
        {isFullscreen && images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111511]/95 backdrop-blur-md"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-none text-white transition-colors z-50"
            >
              <X className="w-8 h-8" />
            </button>
            
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                }}
                className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 text-[#F4C430] transition-colors z-50"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            <motion.img
              key={activeImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={images[activeImageIndex].url}
              className="max-w-full max-h-full object-contain p-4"
              alt="Fullscreen"
            />

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                }}
                className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 text-[#F4C430] transition-colors z-50"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 px-6 py-3">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                    className={`w-2 h-2 transition-all ${activeImageIndex === idx ? 'w-8 bg-[#F4C430]' : 'bg-white/50 hover:bg-white'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
