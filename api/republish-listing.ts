import { getAdminSupabase, getBearerToken } from './_stripe.js';

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: { listingId?: string } | string;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const adminSupabase = await getAdminSupabase();
    const token = getBearerToken(request);
    if (!token) return response.status(401).json({ error: 'Nicht angemeldet.' });

    const { data: authData, error: authError } = await adminSupabase.auth.getUser(token);
    if (authError || !authData.user) return response.status(401).json({ error: 'Sitzung ungültig.' });

    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (typeof body?.listingId !== 'string') return response.status(400).json({ error: 'Inserat fehlt.' });

    const { data: listing, error: listingError } = await adminSupabase
      .from('listings')
      .select('id, user_id, listing_fee, listing_duration_days, status, expires_at')
      .eq('id', body.listingId)
      .eq('user_id', authData.user.id)
      .single();
    if (listingError || !listing) return response.status(404).json({ error: 'Inserat nicht gefunden.' });
    if (Number(listing.listing_fee) > 0) return response.status(400).json({ error: 'Dieses Inserat benötigt eine Zahlung.' });

    const hasExpired = listing.status === 'EXPIRED' || (listing.expires_at && new Date(listing.expires_at).getTime() <= Date.now());
    if (!hasExpired) return response.status(409).json({ error: 'Dieses Inserat ist noch nicht abgelaufen.' });

    const publishedAt = new Date();
    const expiresAt = new Date(publishedAt.getTime() + (listing.listing_duration_days || 30) * 24 * 60 * 60 * 1000);
    const { error: updateError } = await adminSupabase
      .from('listings')
      .update({ status: 'ACTIVE', payment_status: 'NOT_REQUIRED', published_at: publishedAt.toISOString(), expires_at: expiresAt.toISOString() })
      .eq('id', listing.id)
      .eq('user_id', authData.user.id);
    if (updateError) throw updateError;

    return response.status(200).json({ expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('Free listing republish failed', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Das Inserat konnte nicht erneut veröffentlicht werden.' });
  }
}
