import React, { useState } from 'react';
import { 
  User as UserIcon, Heart, Bookmark, Package, ShieldCheck, 
  Settings, Trash2, CheckCircle, Clock, Eye, 
  ExternalLink, Camera 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { Listing, SavedSearch } from '../types';

export const AccountPage: React.FC = () => {
  const { user, setUser, navigate, favorites, showToast, t, language } = useApp();
  
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'searches' | 'settings'>('listings');
  
  // Profile edit fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [city, setCity] = useState(user?.city || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [bio, setBio] = useState(user?.bio || '');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-8">
        <h2 className="font-serif font-bold text-3xl text-[#171A17] dark:text-white">
          {t.closedCommunityNotice}
        </h2>
        <p className="font-sans text-sm text-gray-500 uppercase tracking-widest">
          Bitte logge dich ein, um dein Konto zu verwalten.
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

  const myListings = storage.getListingsByUserId(user.id);
  const myFavoritesListings = storage.getListings().filter((l) => favorites.includes(l.id));
  const mySavedSearches = storage.getSavedSearches(user.id);

  const handleUpdateStatus = (listingId: string, status: 'ACTIVE' | 'RESERVED' | 'SOLD') => {
    storage.updateListingStatus(listingId, status);
    showToast(`Status auf "${status}" aktualisiert.`, 'success');
  };

  const handleDeleteListing = (listingId: string) => {
    if (window.confirm('Möchtest du dieses Inserat wirklich unwiderruflich löschen?')) {
      storage.deleteListing(listingId);
      showToast('Inserat wurde gelöscht.', 'info');
    }
  };

  const handleDeleteSavedSearch = (searchId: string) => {
    storage.deleteSavedSearch(searchId);
    showToast('Suchauftrag gelöscht.', 'info');
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

const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateUserProfile(user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    if (updated) {
      setUser(updated);
      showToast(t.profileUpdated, 'success');
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
    showToast('DSGVO-Datenexport erfolgreich generiert.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* USER HERO BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-12 border-b border-[#123D2A]/10 dark:border-white/10">
        <div className="flex items-center gap-6">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160'}
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
            Öffentliches Profil
          </button>
          
          <button
            onClick={() => navigate('create-listing')}
            className="px-6 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
          >
            Neues Inserat
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-8 border-b border-[#123D2A]/10 dark:border-white/10 overflow-x-auto pb-4">
        {[
          { id: 'listings', label: `${t.myListings} (${myListings.length})`, icon: Package },
          { id: 'favorites', label: `${t.myFavorites} (${myFavoritesListings.length})`, icon: Heart },
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
                          <span className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest ${lst.status === 'ACTIVE' ? 'bg-[#CBD9C6] text-[#123D2A]' : lst.status === 'RESERVED' ? 'bg-[#FAF2CC] text-[#123D2A]' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {lst.status === 'ACTIVE' ? 'Aktiv' : lst.status === 'RESERVED' ? 'Reserviert' : 'Verkauft'}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-gray-400">
                            {lst.views} Aufrufe
                          </span>
                        </div>
                        <h3
                          onClick={() => navigate('listing-detail', { id: lst.id })}
                          className="font-serif font-bold text-xl text-[#171A17] dark:text-white cursor-pointer hover:underline line-clamp-1"
                        >
                          {lst.title}
                        </h3>
                        <div className="font-sans text-sm text-[#171A17] dark:text-gray-300 mt-2">
                          {lst.isFree ? 'Kostenlos' : `${lst.price} €`}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          {lst.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'ACTIVE')}
                              className="text-[10px] font-bold uppercase tracking-widest text-[#123D2A] dark:text-white hover:underline"
                            >
                              Aktivieren
                            </button>
                          )}
                          {lst.status !== 'RESERVED' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'RESERVED')}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#171A17] dark:hover:text-white transition-colors"
                            >
                              Reservieren
                            </button>
                          )}
                          {lst.status !== 'SOLD' && (
                            <button
                              onClick={() => handleUpdateStatus(lst.id, 'SOLD')}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#171A17] dark:hover:text-white transition-colors"
                            >
                              Verkauft
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteListing(lst.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Inserat löschen"
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
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">Du hast aktuell noch keine Inserate eingestellt.</p>
                <button
                  onClick={() => navigate('create-listing')}
                  className="px-6 py-3 border border-[#123D2A] dark:border-white text-[#123D2A] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#123D2A] hover:text-white dark:hover:bg-white dark:hover:text-[#171A17] transition-colors inline-block"
                >
                  Erstes Inserat aufgeben
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
                          {lst.isFree ? 'Kostenlos' : `${lst.price} €`}
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
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">Du hast noch keine Favoriten markiert.</p>
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
                        Benachrichtigung: <span className="font-bold text-[#123D2A] dark:text-[#F4C430]">{s.notificationFrequency}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => navigate('search', { query: s.query })}
                        className="text-gray-400 hover:text-[#123D2A] dark:hover:text-white transition-colors"
                        title="Suche jetzt ausführen"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSavedSearch(s.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Suchauftrag löschen"
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
                <p className="font-sans text-xs uppercase tracking-widest text-gray-500">Keine gespeicherten Suchaufträge vorhanden.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-16">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
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

<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {t.firstName}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
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
                    className="w-full pb-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Postleitzahl
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Stadt
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pb-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Über mich (Bio)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ein paar nette Worte über dich..."
                  className="w-full py-2 bg-transparent border-b border-[#123D2A]/20 dark:border-white/20 text-sm text-[#171A17] dark:text-white focus:outline-none focus:border-[#123D2A] dark:focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[11px] font-bold uppercase tracking-widest hover:bg-[#171A17] dark:hover:bg-gray-200 transition-colors"
                >
                  Änderungen speichern
                </button>
              </div>
            </form>

            {/* PRIVACY & DATA EXPORT */}
            <div className="pt-16 border-t border-[#123D2A]/10 dark:border-white/10 space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-2xl text-[#171A17] dark:text-white">
                  Datenschutz & DSGVO
                </h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed max-w-lg">
                  Du hast das Recht, jederzeit eine Kopie deiner bei ONLINE BAZAR gespeicherten Daten (Profil, Inserate, Favoriten) herunterzuladen.
                </p>
              </div>
              <button
                onClick={handleExportData}
                className="px-6 py-3 border border-gray-300 dark:border-white/20 text-[#171A17] dark:text-white text-[11px] font-bold uppercase tracking-widest hover:border-[#171A17] dark:hover:border-white transition-colors"
              >
                Meine Daten exportieren (JSON)
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
