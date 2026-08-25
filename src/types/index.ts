export type Role = 'USER' | 'MEMBER' | 'MODERATOR' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'WARNED' | 'TEMPORARILY_SUSPENDED' | 'BANNED';

export type Language = 'de' | 'en';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  country: string;
  postalCode: string;
  city: string;
  language: Language;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  ratingAverage: number;
  ratingCount: number;
  responseRate: string;
  activeListingsCount: number;
  blockedUserIds: string[];
}

export type ListingType = 'SELL' | 'FREE' | 'WANTED';

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'USED' | 'DEFECTIVE';

export type DeliveryType = 'PICKUP' | 'SHIPPING' | 'BOTH';

export type ListingStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'ACTIVE' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'EXPIRED' 
  | 'REJECTED' 
  | 'BLOCKED' 
  | 'DELETED';

export interface ListingImage {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
}

export interface Listing {
  id: string;
  userId: string;
  type: ListingType;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  condition: ListingCondition;
  price: number;
  negotiable: boolean;
  isFree: boolean;
  maxBudget?: number;
  deliveryType: DeliveryType;
  country: string;
  postalCode: string;
  city: string;
  status: ListingStatus;
  views: number;
  favoritesCount: number;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  moderationReason?: string;
  seller?: {
    id: string;
    username: string;
    firstName: string;
    avatarUrl?: string;
    ratingAverage: number;
    ratingCount: number;
    memberSince: string;
    emailVerified: boolean;
    city: string;
    postalCode: string;
  };
}

export interface Subcategory {
  id: string;
  slug: string;
  name: Record<Language, string>;
}

export interface Category {
  id: string;
  slug: string;
  icon: string;
  name: Record<Language, string>;
  subcategories: Subcategory[];
  itemCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingType: ListingType;
  listingImage: string;
  listingStatus: ListingStatus;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCountForUser: number;
  isArchived?: boolean;
}

export interface SavedSearch {
  id: string;
  userId: string;
  title: string;
  query: string;
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  radiusKm?: number;
  condition?: ListingCondition;
  deliveryType?: DeliveryType;
  notificationFrequency: 'INSTANT' | 'DAILY' | 'OFF';
  createdAt: string;
  matchCount?: number;
}

export interface Review {
  id: string;
  transactionId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewedUserId: string;
  rating: number; // 1-5
  tags: string[]; // e.g. 'friendly', 'reliable', 'quick_reply', 'as_described'
  comment?: string;
  createdAt: string;
}

export type ReportReason =
  | 'FORBIDDEN_PRODUCT'
  | 'SCAM_FRAUD'
  | 'FAKE_REPLICA'
  | 'SPAM'
  | 'WRONG_CATEGORY'
  | 'OFFENSIVE'
  | 'SERVICE_JOB'
  | 'ANIMAL_PET'
  | 'REAL_ESTATE'
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  listingId?: string;
  listingTitle?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderatorNotes?: string;
  moderatorId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  targetUserId?: string;
  listingId?: string;
  action: 'WARN' | 'SUSPEND' | 'BAN' | 'APPROVE_LISTING' | 'REJECT_LISTING' | 'DELETE_LISTING';
  reason: string;
  createdAt: string;
}

export type NotificationType =
  | 'NEW_MESSAGE'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_EXPIRED'
  | 'SAVED_SEARCH_HIT'
  | 'NEW_REVIEW'
  | 'SYSTEM_ALERT';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformConfig {
  maxListingsPerDay: number;
  repostCooldownDays: number;
  maxPhotosPerListing: number;
  listingExpiryDays: number;
  autoModerationActive: boolean;
  registrationOpen: boolean;
  emailVerificationRequired: boolean;
  bannedKeywords: string[];
}
