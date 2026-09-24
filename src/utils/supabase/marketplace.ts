import type { DeliveryType, ListingCondition, ListingImage, ListingType } from '../../types';
import { createClient } from './client';

export const LISTING_IMAGES_BUCKET = 'listing-images';

export interface SupabaseListingDraft {
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
  status: 'ACTIVE';
  views: number;
  favoritesCount: number;
  publishedAt?: string;
  expiresAt?: string;
}

interface PendingImageFile {
  id: string;
  file: File;
}

const getFileExtension = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
};

const createImageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export async function createListingWithImages(
  draft: SupabaseListingDraft,
  images: ListingImage[],
  pendingFiles: PendingImageFile[],
) {
  const supabase = createClient();
  const pendingById = new Map(pendingFiles.map((pendingFile) => [pendingFile.id, pendingFile.file]));
  const uploadedPaths: string[] = [];

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      user_id: draft.userId,
      type: draft.type,
      title: draft.title,
      description: draft.description,
      category_id: draft.categoryId,
      subcategory_id: draft.subcategoryId || null,
      brand: draft.brand || null,
      condition: draft.condition,
      price: draft.price,
      negotiable: draft.negotiable,
      is_free: draft.isFree,
      max_budget: draft.maxBudget ?? null,
      delivery_type: draft.deliveryType,
      country: draft.country,
      postal_code: draft.postalCode,
      city: draft.city,
      status: draft.status,
      views: draft.views,
      favorites_count: draft.favoritesCount,
      published_at: draft.publishedAt ?? null,
      expires_at: draft.expiresAt ?? null,
    })
    .select('id')
    .single();

  if (listingError || !listing) {
    throw new Error(listingError?.message ?? 'Das Inserat konnte nicht gespeichert werden.');
  }

  try {
    const storedImages: { listing_id: string; url: string; sort_order: number; is_cover: boolean }[] = [];

    for (const image of images) {
      const file = pendingById.get(image.id);
      let url = image.url;

      if (file) {
        const path = `${draft.userId}/${listing.id}/${createImageId()}.${getFileExtension(file)}`;
        const { error: uploadError } = await supabase.storage
          .from(LISTING_IMAGES_BUCKET)
          .upload(path, file, {
            cacheControl: '3600',
            contentType: file.type || 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        uploadedPaths.push(path);
        url = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      storedImages.push({
        listing_id: listing.id,
        url,
        sort_order: image.sortOrder,
        is_cover: image.isCover,
      });
    }

    if (storedImages.length > 0) {
      const { data: imageRows, error: imageError } = await supabase
        .from('listing_images')
        .insert(storedImages)
        .select('id, url, sort_order, is_cover');

      if (imageError) {
        throw new Error(imageError.message);
      }

      return {
        id: listing.id as string,
        images: (imageRows ?? []).map((row) => ({
          id: row.id as string,
          url: row.url as string,
          sortOrder: row.sort_order as number,
          isCover: row.is_cover as boolean,
        })),
      };
    }

    return { id: listing.id as string, images: [] as ListingImage[] };
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(LISTING_IMAGES_BUCKET).remove(uploadedPaths);
    }
    await supabase.from('listings').delete().eq('id', listing.id);
    throw error;
  }
}
