/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MarketplaceHeader } from './components/layout/MarketplaceHeader';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { UserSwitcherModal } from './components/layout/UserSwitcherModal';

// Pages
import { HomePage } from './pages/HomePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ListingDetailView } from './components/marketplace/ListingDetailView';
import { ListingWizard } from './components/wizard/ListingWizard';
import { MessengerView } from './components/chat/MessengerView';
import { AccountPage } from './pages/AccountPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { AuthPage } from './pages/AuthPage';
import { StaticPages } from './pages/StaticPages';

const MainContent: React.FC = () => {
  const { currentRoute } = useApp();

  const renderRoute = () => {
    switch (currentRoute) {
      case 'home':
      case 'search':
        return <HomePage />;
      
      case 'listing-detail':
        return <ListingDetailView />;
      
      case 'create-listing':
        return <ListingWizard />;
      
      case 'messages':
        return <MessengerView />;
      
      case 'favorites':
        return <FavoritesPage />;
      
      case 'account':
        return <AccountPage />;
      
      case 'user-profile':
        return <UserProfilePage />;
      
      case 'admin-moderation':
        return <AdminModerationPage />;
      
      case 'login':
        return <AuthPage initialMode="login" />;
      
      case 'register':
        return <AuthPage initialMode="register" />;
      
      case 'about':
      case 'rules':
      case 'safety':
      case 'faq':
      case 'contact':
      case 'impressum':
      case 'datenschutz':
      case 'agb':
        return <StaticPages pageType={currentRoute} />;
      
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F6] dark:bg-[#0D1410] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <MarketplaceHeader />
      
      <div className="flex-1">
        {renderRoute()}
      </div>

      <Footer />
      <MobileNav />
      <Toast />
      <UserSwitcherModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
