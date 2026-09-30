import React, { useState } from 'react';
import { 
  User as UserIcon, Heart, Bookmark, Package, ShieldCheck, 
  Settings, Trash2, CheckCircle, Clock, Eye, 
  ExternalLink, Camera, X, CreditCard, RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { Listing, SavedSearch } from '../types';
import { updateProfile } from '../utils/supabase/auth';
import { createListingCheckout, republishFreeListing } from '../utils/stripe';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { localizeText } from '../i18n/translations';

const profileInputClass = 'w-full border border-[#123D2A]/20 bg-white/80 px-4 py-3 text-sm text-[#171A17] outline-none transition focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/25 dark:border-white/15 dark:bg-[#111511] dark:text-white';
const profileSectionClass = 'space-y-6 border border-[#123D2A]/15 bg-white/65 p-5 sm:p-7 dark:border-white/10 dark:bg-white/[0.03]';

export const AccountPage: React.FC = () => {
  const { user, setUser, navigate, favorites, showToast, t, language } = useApp();
  const ui = (value: string) => localizeText(value, language);
  
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'searches' | 'settings'>('listings');
  
  // Profile edit fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [city, setCity] = useState(user?.city || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [republishListing, setRepublishListing] = useState<Listing | null>(null);
  const [isRepublishing, setIsRepublishing] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deleteSearchId, setDeleteSearchId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-8">
        <h2 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">
          {t.closedCommunityNotice}
        </h2>
        <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">
          {ui('Bitte logge dich ein, um dein Konto zu verwalten.')}
        </p>
        <button
          onClick={() => navigate('login')}
          className="px-8 py-4 bg-[#123D2A] text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#171A17] transition-colors"
        >
          {t.login}
        </button>
      </div>
    );
  }

  const myListings = storage.getListingsByUserId(user.id).filter((listing) => listing.status !== 'PENDING');
  const myFavoritesListings = storage.getListings().filter((l) => favorites.includes(l.id));
  const mySavedSearches = storage.getSavedSearches(user.id);

  const handleUpdateStatus = (listingId: string, status: 'ACTIVE' | 'RESERVED' | 'SOLD') => {
    storage.updateListingStatus(listingId, status);
    showToast(`Status auf "${status}" aktualisiert.`, 'success');
  };

  const handleRepublish = async () => {
    if (!republishListing) return;
    setIsRepublishing(true);
    try {
      const listingFee = Number(republishListing.listingFee ?? 0);
      if (listingFee > 0) {
        const checkoutUrl = await createListingCheckout(republishListing.id, { republish: true });
        window.location.assign(checkoutUrl);
        return;
      }

      const result = await republishFreeListing(republishListing.id);
      storage.saveListing({
        ...republishListing,
        status: 'ACTIVE',
        publishedAt: new Date().toISOString(),
        expiresAt: result.expiresAt,
        updatedAt: new Date().toISOString(),
      });
      setRepublishListing(null);
      showToast(ui('Dein Inserat wurde erneut veröffentlicht.'), 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : ui('Das Inserat konnte nicht erneut veröffentlicht werden.'), 'error');
    } finally {
      setIsRepublishing(false);
    }
  };

  const handleDeleteListing = (listingId: string) => {
    setDeleteListingId(listingId);
  };

  const confirmDeleteListing = () => {
    if (deleteListingId) {
      storage.deleteListing(deleteListingId);
      showToast(ui('Inserat wurde gelöscht.'), 'info');
    }
    setDeleteListingId(null);
  };

  const handleDeleteSavedSearch = (searchId: string) => {
    setDeleteSearchId(searchId);
  };

  const confirmDeleteSavedSearch = () => {
    if (deleteSearchId) {
      storage.deleteSavedSearch(deleteSearchId);
      showToast(ui('Suchauftrag gelöscht.'), 'info');
    }
    setDeleteSearchId(null);
  };

  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(t.profilePictureError, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      });
      const updated = storage.updateUserProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      if (updated) setUser(updated);
      showToast(t.profileUpdated || ui('Dein Profil wurde erfolgreich gespeichert.'), 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : ui('Dein Profil konnte nicht gespeichert werden.'), 'error');
    }
  };

  const handleExportData = () => {
    const data = {
      user,
      listings: myListings,
      favorites,
      savedSearches: mySavedSearches,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `be-halal-export-${user.username}.json`;
    a.click();
    showToast(ui('DSGVO-Datenexport erfolgreich generiert.'), 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* USER HERO BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-12 border-b border-[#123D2A]/10 dark:border-white/10">
        <div className="flex items-center gap-6">
          <img
            src={user.avatarUrl || '/assets/default-avatar.svg'}
            alt={user.firstName}
            className="w-24 h-24 object-cover"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-serif font-bold text-4xl text-[#123D2A] dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              {user.emailVerified && (
                <ShieldCheck className="w-5 h-5 text-[#123D2A] dark:text-[#F4C430]" />
              )}
            </div>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500">
              @{user.username} • {user.postalCode} {user.city} • Mitglied seit {new Date(user.createdAt).getFullYear()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('user-profile', { username: user.username })}
            className="px-6 py-3 border border-[#123D2A]/20 dark:border-white/20 text-[#171A17] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:border-[#123D2A] dark:hover:border-white transition-colors"
          >
            {ui('Öffentliches Profil')}
          </button>
          
          <button
            onClick={() => navigate('create-listing')}
            className="px-6 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
          >
            {ui('Neues Inserat')}
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-8 border-b border-[#123D2A]/10 dark:border-white/10 overflow-x-auto pb-4">
        {[
          { id: 'listings', label: `${t.myListings} (${myListings.length})`, icon: Package },
          { id: 'favorites', label: `${t.favorites} (${myFavoritesListings.length})`, icon: Heart },
          { id: 'searches', label: `${t.savedSearches} (${mySavedSearches.length})`, icon: Bookmark },
          { id: 'settings', label: t.profileSettings, icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
              activeTab === tab.id
                ? 'border-[#F4C430] text-[#123D2A] dark:text-[#F4C430]'
                : 'border-transparent text-gray-400 hover:text-[#171A17] dark:hover:text-gray-300'
            }`}
            style={{ marginBottom: '-18px' }}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-8">
        {/* TAB CONTENT: MY LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {myListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myListings.map((lst) => (
                  <div key={lst.id} className="flex gap-6 pb-6 border-b border-[#123D2A]/10 dark:border-white/10">
                    <img
                      src={lst.images[0]?.url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=120'}
                      alt=""
                      className="w-32 h-32 object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest ${lst.status === 'ACTIVE' ? 'bg-[#CBD9C6] text-[#123D2A]' : lst.status === 'RESERVED' ? 'bg-[#FAF2CC] text-[#123D2A]' : lst.status === 'EXPIRED' ? 'bg-[#FCE4E4] text-[#8B2C2C]' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {lst.status === 'ACTIVE' ? ui('Aktiv') : lst.status === 'RESERVED' ? ui('Reserviert') : lst.status === 'EXPIRED' ? ui('Abgelaufen') : ui('Verkauft')}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-gray-400">
                            {lst.views} {ui('Aufrufe')}
                          </span>
                        </div>
                        <h3
                          onClick={() => navigate('listing-detail', { id: lst.id })}
                          className="font-serif font-bold text-xl text-[#171A17] dark:text-white cursor-pointer hover:underline line-clamp-1"
                        >
                          {lst.title}
                        </h3>
                        <div className="font-sans text-sm text-[#171A17] dark:text-gray-300 mt-2">
                          {lst.isFree ? t.freePrice : `${lst.price} €`}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          {lst.status === 'EXPIRED' ? (
                            <button
                              onClick={() => setRepublishListing(lst)}
                              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] hover:underline dark:text-[#F4C430]"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {ui('Erneut veröffentlichen')}
                            </button>
                          ) : lst.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'ACTIVE')}
                              className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:underline"
                            >
                              {ui('Aktivieren')}
                            </button>
                          )}
                          {lst.status !== 'RESERVED' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'RESERVED')}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#171A17] dark:hover:text-white transition-colors"
                            >
                              {ui('Reservieren')}
                            </button>
                          )}
                          {lst.status !== 'SOLD' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'SOLD')}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#171A17] dark:hover:text-white transition-colors"
                            >
                              {ui('Verkauft')}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteListing(lst.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title={ui('Inserat löschen')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{ui('Du hast aktuell noch keine Inserate eingestellt.')}</p>
                <button
                  onClick={() => navigate('create-listing')}
                  className="px-6 py-3 border border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#123D2A] hover:text-white dark:hover:bg-white dark:hover:text-[#171A17] transition-colors inline-block"
                >
                  {ui('Erstes Inserat aufgeben')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            {myFavoritesListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {myFavoritesListings.map((lst) => (
                  <div
                    key={lst.id}
                    onClick={() => navigate('listing-detail', { id: lst.id })}
                    className="group cursor-pointer space-y-4"
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={lst.images[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-sm font-bold text-[#171A17] dark:text-white">
                          {lst.isFree ? t.freePrice : `${lst.price} €`}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-gray-400">{lst.city}</span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#171A17] dark:text-white group-hover:underline line-clamp-1">
                        {lst.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{ui('Du hast noch keine Favoriten markiert.')}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: SAVED SEARCHES */}
        {activeTab === 'searches' && (
          <div className="space-y-6">
            {mySavedSearches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mySavedSearches.map((s) => (
                  <div
                    key={s.id}
                    className="pb-6 border-b border-[#123D2A]/10 dark:border-white/10 flex items-start justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                        {s.title}
                      </h4>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-gray-500">
                        {ui('Benachrichtigung')}: <span className="font-bold text-[#123D2A] dark:text-[#F4C430]">{s.notificationFrequency}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => navigate('search', { query: s.query })}
                        className="text-gray-400 hover:text-[#123D2A] dark:hover:text-white transition-colors"
                        title={ui('Suche jetzt ausführen')}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSavedSearch(s.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title={ui('Suchauftrag löschen')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">{ui('Keine gespeicherten Suchaufträge vorhanden.')}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-16">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              
              
              <section className={profileSectionClass}>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={avatarUrl || '/assets/default-avatar.svg'}
                    alt={firstName}
                    className="w-24 h-24 rounded-full object-cover grayscale border border-[#123D2A]/10 dark:border-white/10"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-[#171A17]/60 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity backdrop-blur-sm">
                    <Camera className="w-6 h-6" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="font-serif font-bold text-xl text-[#171A17] dark:text-white">{t.profilePicture}</h3>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">{t.profilePictureSize}</p>
                </div>
              </div>
              </section>

              <section className={profileSectionClass}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{ui('Persönliche Angaben')}</p>
                <p className="mt-2 text-sm text-gray-500">{ui('Halte deine sichtbaren Kontaktdaten aktuell.')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {t.firstName}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={profileInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {t.lastName}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={profileInputClass}
                  />
                </div>
              </div>

              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{ui('Wohnort')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {ui('Postleitzahl')}
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={profileInputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {ui('Stadt')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={profileInputClass}
                  />
                </div>
              </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  {ui('Über mich (Bio)')}
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={ui('Ein paar nette Worte über dich...')}
                  className={`${profileInputClass} resize-none`}
                />
              </div>
              </section>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
                >
                  {ui('Änderungen speichern')}
                </button>
              </div>
            </form>

            {/* PRIVACY & DATA EXPORT */}
            <div className="pt-16 border-t border-[#123D2A]/10 dark:border-white/10 space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  {ui('Datenschutz & DSGVO')}
                </h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-lg">
                  {ui('Du hast das Recht, jederzeit eine Kopie deiner bei ONLINE BAZAR gespeicherten Daten (Profil, Inserate, Favoriten) herunterzuladen.')}
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:border-[#171A17] dark:hover:border-white transition-colors"
              >
                {ui('Meine Daten exportieren (JSON)')}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteListingId !== null}
        title="Inserat löschen?"
        message="Möchtest du dieses Inserat wirklich löschen? Es wird aus deiner Liste entfernt und kann nicht automatisch wiederhergestellt werden."
        onClose={() => setDeleteListingId(null)}
        onConfirm={confirmDeleteListing}
      />
      <ConfirmDialog
        isOpen={deleteSearchId !== null}
        title="Suchauftrag löschen?"
        message="Möchtest du diesen gespeicherten Suchauftrag wirklich löschen?"
        onClose={() => setDeleteSearchId(null)}
        onConfirm={confirmDeleteSavedSearch}
      />

      {republishListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171A17]/70 px-4 py-8" role="dialog" aria-modal="true" aria-labelledby="republish-title">
          <div className="w-full max-w-lg border border-[#123D2A]/15 bg-[#F5F1E8] p-6 shadow-2xl dark:border-white/10 dark:bg-[#111511] sm:p-8">
            <div className="flex items-start justify-between gap-6 border-b border-[#123D2A]/10 pb-5 dark:border-white/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123D2A] dark:text-[#F4C430]">{ui('Wiederveröffentlichung')}</p>
                <h2 id="republish-title" className="mt-2 font-serif text-2xl font-bold text-[#171A17] dark:text-white">{ui('Inserat erneut veröffentlichen')}</h2>
              </div>
              <button type="button" onClick={() => setRepublishListing(null)} className="p-1 text-gray-500 hover:text-[#123D2A] dark:hover:text-[#F4C430]" aria-label={ui('Modal schließen')}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 border border-[#123D2A]/15 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <img src={republishListing.images[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'} alt="" className="h-16 w-16 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{ui('Inserat')}</p>
                  <p className="mt-2 truncate font-serif text-xl font-bold text-[#171A17] dark:text-white">{republishListing.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{ui('Produktpreis')}</p>
                  <p className="mt-2 font-bold text-[#171A17] dark:text-white">{republishListing.isFree ? t.freePrice : `€ ${Number(republishListing.price).toFixed(2)}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="border border-[#123D2A]/15 p-4 dark:border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{ui('Laufzeit')}</p>
                  <p className="mt-2 font-bold text-[#171A17] dark:text-white">{republishListing.listingDurationDays ?? 30} {ui('Tage')}</p>
                </div>
                <div className="border border-[#123D2A]/15 p-4 dark:border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{ui('Anzeigenpreis')}</p>
                  <p className="mt-2 font-bold text-[#171A17] dark:text-white">{Number(republishListing.listingFee ?? 0) > 0 ? `€ ${Number(republishListing.listingFee).toFixed(2)}` : t.freePrice}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {ui('Nach erfolgreicher Zahlung wird das Inserat wieder aktiviert und ist für die neue Laufzeit öffentlich sichtbar.')}
              </p>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRepublishListing(null)} className="border border-[#123D2A]/20 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:border-white/20 dark:text-white">Abbrechen</button>
              <button type="button" disabled={isRepublishing} onClick={() => void handleRepublish()} className="inline-flex items-center justify-center gap-2 bg-[#123D2A] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#171A17] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#F4C430] dark:text-[#171A17]">
                {Number(republishListing.listingFee ?? 0) > 0 && <CreditCard className="h-4 w-4" />}
                {isRepublishing ? ui('Wird vorbereitet...') : Number(republishListing.listingFee ?? 0) > 0 ? ui('Zum Warenkorb & bezahlen') : ui('Jetzt erneut veröffentlichen')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
