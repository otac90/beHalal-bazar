import { 
  User, Listing, Conversation, Message, SavedSearch, 
  Review, Report, PlatformConfig, NotificationItem, Language, ListingStatus 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_LISTINGS, INITIAL_CONVERSATIONS, 
  INITIAL_REVIEWS, INITIAL_SAVED_SEARCHES, INITIAL_REPORTS, INITIAL_CONFIG 
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'behalal_users_v1',
  CURRENT_USER_ID: 'behalal_current_user_id_v1',
  LISTINGS: 'behalal_listings_v1',
  CONVERSATIONS: 'behalal_conversations_v1',
  MESSAGES: 'behalal_messages_v1',
  FAVORITES: 'behalal_favorites_v1',
  SAVED_SEARCHES: 'behalal_saved_searches_v1',
  REVIEWS: 'behalal_reviews_v1',
  REPORTS: 'behalal_reports_v1',
  NOTIFICATIONS: 'behalal_notifications_v1',
  CONFIG: 'behalal_config_v1',
  LANGUAGE: 'behalal_language_v1',
  THEME: 'behalal_theme_v1',
};

// Initial messages for mock conversations
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-bilal',
    content: 'Salam aleikum Amina! Ist das Woom 3 Kinderfahrrad noch da?',
    createdAt: '2026-08-21T10:15:00Z',
    readAt: '2026-08-21T10:20:00Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-amina',
    content: 'Aleikum salam Bilal! Ja, ist noch verfügbar und kann gerne heute oder morgen in 1100 Wien besichtigt werden.',
    createdAt: '2026-08-21T10:30:00Z',
    readAt: '2026-08-21T10:35:00Z',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-bilal',
    content: 'Perfekt, dann bis morgen um 17:00 Uhr in Wien 10! Vielen Dank.',
    createdAt: '2026-08-21T11:45:00Z',
    readAt: '2026-08-21T11:50:00Z',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'user-amina',
    content: 'Salam Fatima! Ist das Handy noch verfügbar und wäre versicherter Versand möglich?',
    createdAt: '2026-08-21T13:20:00Z',
  },
];

const INITIAL_FAVORITES: { userId: string; listingId: string; createdAt: string }[] = [
  { userId: 'user-amina', listingId: 'lst-2', createdAt: '2026-08-19T10:00:00Z' },
  { userId: 'user-amina', listingId: 'lst-7', createdAt: '2026-08-20T08:00:00Z' },
  { userId: 'user-bilal', listingId: 'lst-1', createdAt: '2026-08-20T12:00:00Z' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-amina',
    type: 'NEW_MESSAGE',
    title: 'Neue Nachricht von Bilal Mujic',
    message: 'Zu deinem Inserat „Woom 3 Kinderfahrrad 16 Zoll – Rot“',
    link: '/nachrichten/conv-1',
    read: false,
    createdAt: '2026-08-21T11:45:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-amina',
    type: 'SAVED_SEARCH_HIT',
    title: 'Neuer Treffer für deine Suche',
    message: '„Kinderfahrrad Wien bis 350 €“ hat einen neuen Treffer.',
    link: '/anzeige/lst-1',
    read: true,
    createdAt: '2026-08-19T14:20:00Z',
  },
];

class StorageService {
  private listeners: (() => void)[] = [];

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  public getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const users = this.getUsers();
    if (!currentId) {
      // Default to Amina for convenient testing
      const defaultUser = users[0] || null;
      if (defaultUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
      }
      return defaultUser;
    }
    if (currentId === 'guest') {
      return null;
    }
    return users.find((u) => u.id === currentId) || users[0] || null;
  }

  public setCurrentUser(userOrId: string | User | null) {
    if (userOrId === null) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'guest');
    } else if (typeof userOrId === 'string') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userOrId);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userOrId.id);
    }
    this.notify();
  }

  public updateUser(updatedUser: User) {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  public getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  public updateUserProfile(userId: string, fields: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index >= 0) {
      users[index] = { ...users[index], ...fields, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.notify();
      return users[index];
    }
    return null;
  }

  public addUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
    return user;
  }

  public banUser(userId: string) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index >= 0) {
      users.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    // Also mark user's listings as removed
    const listings = this.getListings().filter((l) => l.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify();
  }

  public getListingsByUserId(userId: string): Listing[] {
    return this.getListings().filter((l) => l.userId === userId);
  }

  public updateListingStatus(id: string, status: ListingStatus) {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === id);
    if (listing) {
      listing.status = status;
      listing.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
      this.notify();
    }
  }

  public getConversationsForUser(userId: string): Conversation[] {
    return this.getConversations(userId);
  }

  public markConversationAsRead(conversationId: string, userId: string) {
    const rawConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let convs: Conversation[] = [];
    try {
      convs = rawConvs ? JSON.parse(rawConvs) : INITIAL_CONVERSATIONS;
    } catch {
      convs = INITIAL_CONVERSATIONS;
    }
    
    const conv = convs.find((c) => c.id === conversationId);
    if (conv && conv.unreadCountForUser && conv.unreadCountForUser > 0) {
      conv.unreadCountForUser = 0;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
      this.notify();
    }
  }

  public saveConfig(newConfig: PlatformConfig) {
    this.updateConfig(newConfig);
  }

  // --- Listings ---
  public getListings(): Listing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LISTINGS;
    }
  }

  public getListingById(id: string): Listing | null {
    const listings = this.getListings();
    return listings.find((l) => l.id === id) || null;
  }

  public saveListing(listing: Listing) {
    const listings = this.getListings();
    const index = listings.findIndex((l) => l.id === listing.id);
    if (index >= 0) {
      listings[index] = { ...listing, updatedAt: new Date().toISOString() };
    } else {
      listings.unshift(listing);
    }
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify();
  }

  public deleteListing(id: string) {
    const listings = this.getListings().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    this.notify();
  }

  public incrementListingViews(id: string) {
    const listings = this.getListings();
    const listing = listings.find((l) => l.id === id);
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    }
  }

  // --- Favorites ---
  public getFavorites(userId: string): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    let favs: { userId: string; listingId: string; createdAt: string }[] = INITIAL_FAVORITES;
    if (raw) {
      try {
        favs = JSON.parse(raw);
      } catch {
        favs = INITIAL_FAVORITES;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(INITIAL_FAVORITES));
    }
    return favs.filter((f) => f.userId === userId).map((f) => f.listingId);
  }

  public toggleFavorite(userId: string, listingId: string): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    let favs: { userId: string; listingId: string; createdAt: string }[] = [];
    try {
      favs = raw ? JSON.parse(raw) : INITIAL_FAVORITES;
    } catch {
      favs = INITIAL_FAVORITES;
    }

    const index = favs.findIndex((f) => f.userId === userId && f.listingId === listingId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push({ userId, listingId, createdAt: new Date().toISOString() });
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    this.notify();
    return isFav;
  }

  // --- Saved Searches ---
  public getSavedSearches(userId: string): SavedSearch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    let searches: SavedSearch[] = INITIAL_SAVED_SEARCHES;
    if (raw) {
      try {
        searches = JSON.parse(raw);
      } catch {
        searches = INITIAL_SAVED_SEARCHES;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(INITIAL_SAVED_SEARCHES));
    }
    return searches.filter((s) => s.userId === userId);
  }

  public saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): SavedSearch {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    let searches: SavedSearch[] = [];
    try {
      searches = raw ? JSON.parse(raw) : INITIAL_SAVED_SEARCHES;
    } catch {
      searches = INITIAL_SAVED_SEARCHES;
    }
    const newSearch: SavedSearch = {
      ...search,
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString(),
      matchCount: 1,
    };
    searches.unshift(newSearch);
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
    this.notify();
    return newSearch;
  }

  public deleteSavedSearch(id: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    let searches: SavedSearch[] = [];
    try {
      searches = raw ? JSON.parse(raw) : INITIAL_SAVED_SEARCHES;
    } catch {
      searches = INITIAL_SAVED_SEARCHES;
    }
    searches = searches.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
    this.notify();
  }

  // --- Conversations & Messages ---
  public getConversations(userId: string): Conversation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let convs: Conversation[] = INITIAL_CONVERSATIONS;
    if (raw) {
      try {
        convs = JSON.parse(raw);
      } catch {
        convs = INITIAL_CONVERSATIONS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    }
    return convs.filter((c) => c.buyerId === userId || c.sellerId === userId);
  }

  public getMessages(conversationId: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    let messages: Message[] = INITIAL_MESSAGES;
    if (raw) {
      try {
        messages = JSON.parse(raw);
      } catch {
        messages = INITIAL_MESSAGES;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    return messages.filter((m) => m.conversationId === conversationId);
  }

  public sendMessage(conversationId: string, senderId: string, content: string): Message {
    const rawMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    let messages: Message[] = [];
    try {
      messages = rawMessages ? JSON.parse(rawMessages) : INITIAL_MESSAGES;
    } catch {
      messages = INITIAL_MESSAGES;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    // Update conversation lastMessage
    const rawConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let convs: Conversation[] = [];
    try {
      convs = rawConvs ? JSON.parse(rawConvs) : INITIAL_CONVERSATIONS;
    } catch {
      convs = INITIAL_CONVERSATIONS;
    }
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = content;
      conv.lastMessageAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    }

    this.notify();
    return newMessage;
  }

  public startConversation(listing: Listing, buyer: User): Conversation {
    const rawConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    let convs: Conversation[] = [];
    try {
      convs = rawConvs ? JSON.parse(rawConvs) : INITIAL_CONVERSATIONS;
    } catch {
      convs = INITIAL_CONVERSATIONS;
    }

    // Check if conversation already exists
    let existing = convs.find((c) => c.listingId === listing.id && c.buyerId === buyer.id);
    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingType: listing.type,
      listingImage: listing.images[0]?.url || '',
      listingStatus: listing.status,
      buyerId: buyer.id,
      buyerName: `${buyer.firstName} ${buyer.lastName}`,
      buyerAvatar: buyer.avatarUrl,
      sellerId: listing.userId,
      sellerName: listing.seller?.firstName || 'Verkäufer',
      sellerAvatar: listing.seller?.avatarUrl,
      lastMessage: 'Konversation gestartet',
      lastMessageAt: new Date().toISOString(),
      unreadCountForUser: 0,
    };

    convs.unshift(newConv);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    this.notify();
    return newConv;
  }

  // --- Reviews ---
  public getReviewsForUser(userId: string): Review[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    let reviews: Review[] = INITIAL_REVIEWS;
    if (raw) {
      try {
        reviews = JSON.parse(raw);
      } catch {
        reviews = INITIAL_REVIEWS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    return reviews.filter((r) => r.reviewedUserId === userId);
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    let reviews: Review[] = [];
    try {
      reviews = raw ? JSON.parse(raw) : INITIAL_REVIEWS;
    } catch {
      reviews = INITIAL_REVIEWS;
    }
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Update user average rating
    const userReviews = reviews.filter((r) => r.reviewedUserId === review.reviewedUserId);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === review.reviewedUserId);
    if (targetUser) {
      targetUser.ratingAverage = Number(avg.toFixed(1));
      targetUser.ratingCount = userReviews.length;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    this.notify();
    return newReview;
  }

  // --- Reports & Moderation ---
  public getReports(): Report[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_REPORTS;
    }
  }

  public addReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Report {
    const reports = this.getReports();
    const newReport: Report = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notify();
    return newReport;
  }

  public updateReportStatus(reportId: string, status: Report['status'], moderatorNotes?: string, moderatorId?: string) {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      if (moderatorNotes) rep.moderatorNotes = moderatorNotes;
      if (moderatorId) rep.moderatorId = moderatorId;
      rep.resolvedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
      this.notify();
    }
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: NotificationItem[] = INITIAL_NOTIFICATIONS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_NOTIFICATIONS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    return list.filter((n) => n.userId === userId);
  }

  public markNotificationRead(id: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: NotificationItem[] = [];
    try {
      list = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    } catch {
      list = INITIAL_NOTIFICATIONS;
    }
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      this.notify();
    }
  }

  // --- Platform Config ---
  public getConfig(): PlatformConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONFIG;
    }
  }

  public updateConfig(newConfig: PlatformConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
    this.notify();
  }

  // --- Language & Theme ---
  public getLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    return lang === 'en' || lang === 'de' ? lang : 'de';
  }

  public setLanguage(lang: Language) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    this.notify();
  }

  public getTheme(): 'light' | 'dark' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'dark' ? 'dark' : 'light';
  }

  public setTheme(theme: 'light' | 'dark') {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.notify();
  }
}

export const storage = new StorageService();
