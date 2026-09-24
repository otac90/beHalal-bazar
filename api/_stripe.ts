import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt in den Vercel-Umgebungsvariablen.');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function getAdminSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase-Servervariablen fehlen in den Vercel-Umgebungsvariablen.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function getBearerToken(request: { headers: Record<string, string | string[] | undefined> }) {
  const value = request.headers.authorization;
  const header = Array.isArray(value) ? value[0] : value;
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}

export function getAppUrl(request: { headers: Record<string, string | string[] | undefined> }) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`.replace(/\/$/, '');
}

export function ensureStripeConfiguration() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt.');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt.');
  if (!process.env.VITE_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('SUPABASE_URL fehlt.');
  }
}
