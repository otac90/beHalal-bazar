import { createClient } from './supabase/client';

export async function createListingCheckout(listingId: string) {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.');
  }

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId }),
  });

  const rawResponse = await response.text();
  let payload: { url?: string; error?: string } = {};
  try {
    payload = JSON.parse(rawResponse) as typeof payload;
  } catch {
    // Vite's development server returns an HTML 404 for /api routes because
    // Vercel Functions are only available through Vercel or `vercel dev`.
  }
  if (!response.ok || typeof payload.url !== 'string') {
    if (response.status === 404 || rawResponse.trim().startsWith('<!')) {
      throw new Error('Die Zahlungsfunktion ist unter dieser Adresse nicht verfügbar. Bitte die Vercel-URL verwenden oder lokal mit „vercel dev“ starten.');
    }
    throw new Error(payload.error || `Die Zahlungsseite konnte nicht geöffnet werden (HTTP ${response.status}).`);
  }

  return payload.url as string;
}

export async function getListingPaymentStatus(sessionId: string) {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await fetch(`/api/payment-status?session_id=${encodeURIComponent(sessionId)}`, {
    headers: sessionData.session?.access_token
      ? { Authorization: `Bearer ${sessionData.session.access_token}` }
      : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Der Zahlungsstatus konnte nicht geladen werden.');
  }
  return payload as {
    paid: boolean;
    status: string;
    listing: { id: string; title: string; listingFee: number; durationDays: number; expiresAt: string | null };
  };
}
