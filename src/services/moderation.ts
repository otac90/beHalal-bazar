import { Listing, PlatformConfig } from '../types';

export interface ModerationCheckResult {
  allowed: boolean;
  needsReview: boolean;
  reason?: string;
  matchedRule?: string;
}

export function checkListingModeration(
  title: string,
  description: string,
  price: number,
  categoryId: string,
  userId: string,
  existingListings: Listing[],
  config: PlatformConfig
): ModerationCheckResult {
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Keyword check against banned rules
  for (const keyword of config.bannedKeywords) {
    if (combinedText.includes(keyword.toLowerCase())) {
      return {
        allowed: false,
        needsReview: true,
        reason: `Regelverstoß: Der Begriff "${keyword}" weist auf nicht erlaubte Inhalte hin (Dienstleistungen, Jobs, Immobilien, Tiere, Waffen oder Produktfälschungen).`,
        matchedRule: 'BANNED_KEYWORD',
      };
    }
  }

  // 2. Duplicate Detection (within 14 days / repost cooldown)
  const now = new Date().getTime();
  const cooldownMs = config.repostCooldownDays * 24 * 60 * 60 * 1000;

  const normalizedTitle = title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const userRecentListings = existingListings.filter((l) => l.userId === userId && l.status !== 'DELETED');

  for (const l of userRecentListings) {
    const listingAge = now - new Date(l.createdAt).getTime();
    if (listingAge < cooldownMs) {
      const existingNormalized = l.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      
      // If titles are extremely similar and category matches
      if (
        (existingNormalized.includes(normalizedTitle) || normalizedTitle.includes(existingNormalized)) &&
        existingNormalized.length > 5 &&
        l.categoryId === categoryId
      ) {
        return {
          allowed: false,
          needsReview: false,
          reason: `Duplikat-Erkennung: Ein identisches Inserat („${l.title}“) wurde kürzlich eingestellt. Gemäß Community-Regeln ist ein erneutes Einstellen erst nach ${config.repostCooldownDays} Tagen erlaubt.`,
          matchedRule: 'DUPLICATE_LISTING',
        };
      }
    }
  }

  // 3. Daily Posting Limit check (max 2 per 24 hours)
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const listingsLast24h = userRecentListings.filter((l) => new Date(l.createdAt).getTime() > oneDayAgo);

  if (listingsLast24h.length >= config.maxListingsPerDay) {
    return {
      allowed: false,
      needsReview: false,
      reason: `Tageslimit erreicht: Es sind maximal ${config.maxListingsPerDay} neue Inserate pro 24 Stunden erlaubt.`,
      matchedRule: 'RATE_LIMIT',
    };
  }

  return {
    allowed: true,
    needsReview: false,
  };
}
