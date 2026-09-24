import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../../types';
import { createClient } from './client';

export interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string;
  postal_code: string;
  city: string;
  language: User['language'];
  role: User['role'];
  status: User['status'];
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_AVATAR_URL = '/assets/default-avatar.svg';

export async function getProfileForUser(authUser: SupabaseUser): Promise<User> {
  const supabase = createClient();
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  const profile = profileData as Profile | null;

  if (error || !profile) {
    throw new Error(error?.message ?? 'Dein Profil konnte nicht geladen werden.');
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    bio: profile.bio ?? undefined,
    avatarUrl: profile.avatar_url ?? DEFAULT_AVATAR_URL,
    phone: profile.phone ?? undefined,
    country: profile.country,
    postalCode: profile.postal_code,
    city: profile.city,
    language: profile.language,
    role: profile.role,
    status: profile.status,
    emailVerified: Boolean(authUser.email_confirmed_at),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    ratingAverage: Number(profile.rating_average ?? 0),
    ratingCount: profile.rating_count ?? 0,
    responseRate: 'Noch keine Bewertungen',
    activeListingsCount: 0,
    blockedUserIds: [],
  };
}

export async function updateProfile(userId: string, fields: Partial<Profile>) {
  const supabase = createClient();
  const { data: profileData, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select('*')
    .single();
  const data = profileData as Profile | null;

  if (error || !data) {
    throw new Error(error?.message ?? 'Dein Profil konnte nicht gespeichert werden.');
  }

  return data;
}
