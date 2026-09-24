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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.url !== 'string') {
    throw new Error(payload.error || 'Die Zahlungsseite konnte nicht geöffnet werden.');
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
