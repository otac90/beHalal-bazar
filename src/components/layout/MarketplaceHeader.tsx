import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Heart, MessageSquare, PlusCircle, 
  ChevronDown, Sun, Moon, Globe, User as UserIcon, 
  LogOut, ShieldAlert, Sparkles, Layers, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MarketplaceHeader: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    theme,
    setTheme,
    navigate,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    unreadMessagesCount,
    setShowUserSwitcher,
    logout,
    t,
  } = useApp();

  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowCatMenu(false);
      setShowUserMenu(false);
      setShowLangMenu(false);
      setShowAutocomplete(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAutocomplete(false);
    navigate('search');
  };

  const handleSelectAutocomplete = (term: string, catId?: string) => {
    setSearchQuery(term);
    if (catId) setSelectedCategory(catId);
    setShowAutocomplete(false);
    navigate('search');
  };

  const popularSearches = [
    { title: 'Woom Kinderfahrrad', catId: 'sports-leisure' },
    { title: 'Kinderwagen Cybex', catId: 'baby-kids' },
    { title: 'iPhone 15', catId: 'electronics' },
    { title: 'Massivholz Esstisch', catId: 'furniture-living' },
    { title: 'Islamische Bücher', catId: 'books-media' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'liquid-glass' : 'bg-transparent border-b border-transparent'} dark:border-white/5`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'} gap-4 md:gap-8`}>
          
          {/* LOGO AREA */}
          <div 
            id="brand-logo-button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <span className="font-extrabold text-xl md:text-2xl tracking-tighter text-[#123D2A] dark:text-[#F4F1E8] leading-none uppercase">
              ONLINE BAZAR
            </span>
          </div>

          {/* SEARCH BAR (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center">
              <div className="relative w-full flex items-center rounded-full bg-white dark:bg-[#191E19] border border-gray-200 dark:border-white/10 focus-within:border-[#123D2A] dark:focus-within:border-[#F4C430] transition-colors">
                
                {/* Category Dropdown Trigger */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    id="btn-category-selector"
                    onClick={() => setShowCatMenu(!showCatMenu)}
                    className="h-12 px-5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 rounded-l-full transition-colors whitespace-nowrap"
                  >
                    <span className="max-w-[120px] truncate">
                      {selectedCategory 
                        ? categories.find(c => c.id === selectedCategory)?.name[language] || t.categories
                        : t.allCategories}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </button>

                  {/* Category Menu */}
                  {showCatMenu && (
                    <div className="absolute left-0 mt-4 w-64 bg-white dark:bg-[#111511] border border-[#171A17] dark:border-white/20 z-50">
                      <button
                        type="button"
                        onClick={() => { setSelectedCategory(null); setShowCatMenu(false); }}
                        className="w-full px-5 py-3 text-left text-sm font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 text-[#171A17] dark:text-white border-b border-[#171A17] dark:border-white/10"
                      >
                        {t.allCategories}
                      </button>
                      {categories.map((c) => (
                         <button
                         key={c.id}
                         type="button"
                         onClick={() => { setSelectedCategory(c.id); setShowCatMenu(false); }}
                         className="w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-b-0"
                       >
                         {c.name[language]}
                       </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  placeholder={t.searchPlaceholder}
                  className="w-full h-12 px-4 text-sm bg-transparent text-[#171A17] dark:text-white placeholder:text-gray-400 focus:outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  id="btn-execute-search"
                  className="w-10 h-10 mr-1 flex items-center justify-center rounded-full bg-[#F4C430] text-[#123D2A] hover:bg-[#E4B528] transition-colors shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Autocomplete Overlay */}
            {showAutocomplete && (
              <div 
                className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white dark:bg-[#111511] border border-[#171A17] dark:border-white/20 p-4 z-50"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3 border-b border-gray-200 dark:border-white/10 pb-2">
                  {t.popularSearches}
                </div>
                <div>
                  {popularSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAutocomplete(item.title, item.catId)}
                      className="w-full text-left px-3 py-3 text-sm font-bold text-[#171A17] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-white/5 last:border-b-0 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-[#123D2A] dark:text-[#F4C430]" />
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1 md:gap-2">
            
            <button
              id="btn-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 text-[#171A17] dark:text-white hover:opacity-70 transition-opacity"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-[#F4C430]" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* LANGUAGE SELECTOR */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2.5 text-[#171A17] dark:text-white hover:opacity-70 transition-opacity uppercase font-bold text-[11px] tracking-widest flex items-center gap-1"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline-block">{language}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-4 w-40 bg-white dark:bg-[#111511] border border-[#171A17] dark:border-white/20 z-50">
                  <button onClick={() => { setLanguage('de'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'de' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇩🇪</span> DE
                  </button>
                  <button onClick={() => { setLanguage('bs'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'bs' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇧🇦</span> BS
                  </button>
                  <button onClick={() => { setLanguage('en'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'en' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇬🇧</span> EN
                  </button>
                  <button onClick={() => { setLanguage('tr'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'tr' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇹🇷</span> TR
                  </button>
                  <button onClick={() => { setLanguage('ar'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'ar' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇸🇦</span> AR
                  </button>
                  <button onClick={() => { setLanguage('sq'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-white/5 ${language === 'sq' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇦🇱</span> SQ
                  </button>
                  <button onClick={() => { setLanguage('ru'); setShowLangMenu(false); }} className={`w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-colors ${language === 'ru' ? 'bg-gray-50 dark:bg-white/10 text-[#171A17] dark:text-white' : 'text-gray-500 hover:text-[#171A17] dark:hover:text-white'}`}>
                    <span>🇷🇺</span> RU
                  </button>
                </div>
              )}
            </div>


            {user ? (
              <>
                <button
                  onClick={() => navigate('favorites')}
                  className="hidden sm:flex p-2.5 text-[#171A17] dark:text-white hover:opacity-70 transition-opacity"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('messages')}
                  className="hidden sm:flex p-2.5 text-[#171A17] dark:text-white hover:opacity-70 transition-opacity relative"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-[#F4C430] text-[#123D2A] rounded-full text-[10px] font-bold">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('create-listing')}
                  className="hidden md:flex items-center gap-2 px-6 py-3 ml-2 bg-[#123D2A] dark:bg-white text-white dark:text-[#171A17] text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.postListing}</span>
                </button>

                <div className="relative ml-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.firstName}
                      className="w-9 h-9 object-cover grayscale"
                    />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#111511] border border-[#171A17] dark:border-white/20 z-50">
                      <div className="px-5 py-4 border-b border-[#171A17] dark:border-white/20">
                        <p className="font-serif font-bold text-xl text-[#171A17] dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1 truncate">@{user.username}</p>
                      </div>
                      <button onClick={() => { navigate('account'); setShowUserMenu(false); }} className="w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#171A17] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                        {t.myAccount}
                      </button>
                      {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                        <button onClick={() => { navigate('admin'); setShowUserMenu(false); }} className="w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                          {t.adminPanel}
                        </button>
                      )}
                      <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        {t.logout}
                      </button>
                      <div className="border-t border-[#171A17] dark:border-white/20">
                        <button onClick={() => { setShowUserSwitcher(true); setShowUserMenu(false); }} className="w-full px-5 py-3 flex items-center gap-2 text-left text-xs font-bold uppercase tracking-widest text-[#123D2A] dark:text-[#F4C430] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t.switchUserDemo}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('login')} className="px-4 py-2 text-sm font-semibold text-[#171A17] dark:text-white hover:opacity-70">
                  {t.login}
                </button>
                <button onClick={() => navigate('register')} className="px-5 py-2 rounded-full bg-[#123D2A] text-white text-sm font-semibold hover:bg-[#0D2C1E] transition-colors">
                  {t.register}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-12 pl-12 pr-4 rounded-full bg-white dark:bg-[#191E19] text-sm text-[#171A17] dark:text-white placeholder:text-gray-400 border border-transparent focus:outline-none focus:border-[#123D2A] focus:ring-1 focus:ring-[#123D2A] transition-colors"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
          </form>
        </div>
      </div>
    </header>
  );
};
