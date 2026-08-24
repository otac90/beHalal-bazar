import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Language, Listing, Category, PlatformConfig } from '../types';
import { storage } from '../services/storage';
import { getTranslation } from '../i18n/translations';
import { INITIAL_CATEGORIES } from '../data/categories';

export type AppRoute = 
  | 'home'
  | 'search'
  | 'listing-detail'
  | 'create-listing'
  | 'edit-listing'
  | 'messages'
  | 'favorites'
  | 'saved-searches'
  | 'account'
  | 'user-profile'
  | 'admin'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-email'
  | 'about'
  | 'rules'
  | 'safety'
  | 'faq'
  | 'contact'
  | 'impressum'
  | 'datenschutz'
  | 'agb';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  user: User | null;
  language: Language;
  theme: 'light' | 'dark';
  currentRoute: AppRoute;
  routeParams: Record<string, string>;
  searchQuery: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  categories: Category[];
  config: PlatformConfig;
  t: ReturnType<typeof getTranslation>;
  toasts: ToastInfo[];
  favorites: string[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  showUserSwitcher: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setConfig: (config: PlatformConfig) => void;
  navigate: (route: AppRoute, params?: Record<string, string>) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (catId: string | null, subId?: string | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  switchUser: (userId: string | null) => void;
  setShowUserSwitcher: (show: boolean) => void;
  refreshState: () => void;
  toggleFavorite: (listingId: string) => boolean;
  isFavorite: (listingId: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [language, setLanguageState] = useState<Language>(storage.getLanguage());
  const [theme, setThemeState] = useState<'light' | 'dark'>(storage.getTheme());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategoryState] = useState<string | null>(null);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [config, setConfig] = useState<PlatformConfig>(storage.getConfig());
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [favoritesList, setFavoritesList] = useState<string[]>(user ? storage.getFavorites(user.id) : []);

  // Sync with storage on mount and updates
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setUser(storage.getCurrentUser());
      setLanguageState(storage.getLanguage());
      setThemeState(storage.getTheme());
      setConfig(storage.getConfig());
      const u = storage.getCurrentUser();
      if (u) {
        setFavoritesList(storage.getFavorites(u.id));
      } else {
        setFavoritesList([]);
      }
    });

    // Initialize theme in DOM
    const currentTheme = storage.getTheme();
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return unsub;
  }, []);

  const t = getTranslation(language);

  const navigate = (route: AppRoute, params: Record<string, string> = {}) => {
    // Check closed community access barrier:
    // If not logged in and trying to access private pages, prompt login
    const publicRoutes: AppRoute[] = [
      'home', 'login', 'register', 'forgot-password', 'verify-email',
      'about', 'rules', 'safety', 'faq', 'contact', 'impressum', 'datenschutz', 'agb'
    ];

    if (!user && !publicRoutes.includes(route)) {
      showToast(t.closedCommunityNotice, 'info');
      setCurrentRoute('login');
      setRouteParams({ redirectTo: route });
      window.scrollTo(0, 0);
      return;
    }

    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setLanguage = (lang: Language) => {
    storage.setLanguage(lang);
    setLanguageState(lang);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    storage.setTheme(newTheme);
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setSelectedCategory = (catId: string | null, subId: string | null = null) => {
    setSelectedCategoryState(catId);
    setSelectedSubcategoryState(subId);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (userId: string | null) => {
    storage.setCurrentUser(userId);
    const newUser = storage.getCurrentUser();
    setUser(newUser);
    if (newUser) {
      setFavoritesList(storage.getFavorites(newUser.id));
      showToast(`Eingeloggt als ${newUser.firstName} (${newUser.role})`, 'info');
    } else {
      setFavoritesList([]);
      showToast('Gast-Modus aktiviert (Abgemeldet)', 'info');
      setCurrentRoute('home');
    }
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    setFavoritesList([]);
    showToast(t.logout, 'info');
    navigate('home');
  };

  const toggleFavorite = (listingId: string): boolean => {
    if (!user) {
      showToast(t.closedCommunityNotice, 'warning');
      navigate('login');
      return false;
    }
    const isFav = storage.toggleFavorite(user.id, listingId);
    setFavoritesList(storage.getFavorites(user.id));
    showToast(isFav ? t.favoriteAdded : t.favoriteRemoved, 'info');
    return isFav;
  };

  const isFavorite = (listingId: string): boolean => {
    return favoritesList.includes(listingId);
  };

  const refreshState = () => {
    setUser(storage.getCurrentUser());
  };

  const unreadMessagesCount = user 
    ? storage.getConversations(user.id).reduce((sum, c) => sum + (c.unreadCountForUser || 0), 0)
    : 0;

  const unreadNotificationsCount = user 
    ? storage.getNotifications(user.id).filter((n) => !n.read).length
    : 0;

  return (
    <AppContext.Provider
      value={{
        user,
        language,
        theme,
        currentRoute,
        routeParams,
        searchQuery,
        selectedCategory,
        selectedSubcategory,
        categories,
        config,
        t,
        toasts,
        favorites: favoritesList,
        unreadMessagesCount,
        unreadNotificationsCount,
        showUserSwitcher,
        setUser,
        setConfig,
        navigate,
        setLanguage,
        setTheme,
        setSearchQuery,
        setSelectedCategory,
        showToast,
        removeToast,
        switchUser,
        setShowUserSwitcher,
        refreshState,
        toggleFavorite,
        isFavorite,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
