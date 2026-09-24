import { ensureStripeConfiguration, getAdminSupabase, getBearerToken, getStripe } from './_stripe.js';

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: { session_id?: string | string[] };
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  try {
    ensureStripeConfiguration();
    const stripe = await getStripe();
    const adminSupabase = await getAdminSupabase();
    const token = getBearerToken(request);
    if (!token) return response.status(401).json({ error: 'Nicht angemeldet.' });
    const { data: authData, error: authError } = await adminSupabase.auth.getUser(token);
    if (authError || !authData.user) return response.status(401).json({ error: 'Sitzung ungültig.' });

    const queryValue = request.query?.session_id;
    const sessionId = Array.isArray(queryValue) ? queryValue[0] : queryValue;
    if (!sessionId) return response.status(400).json({ error: 'Stripe-Session fehlt.' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.user_id !== authData.user.id) return response.status(403).json({ error: 'Keine Berechtigung.' });
    const listingId = session.metadata?.listing_id;
    if (!listingId) return response.status(404).json({ error: 'Inserat zur Zahlung fehlt.' });

    const { data: listing, error: listingError } = await adminSupabase
      .from('listings')
      .select('id, title, listing_fee, listing_duration_days, expires_at, payment_status, status')
      .eq('id', listingId)
      .eq('user_id', authData.user.id)
      .single();
    if (listingError || !listing) return response.status(404).json({ error: 'Inserat nicht gefunden.' });

    // A successful Checkout session is authoritative even if Stripe's webhook
    // is delayed or a delivery attempt failed. This keeps the listing pending
    // until Stripe has confirmed payment and safely reconciles the server state.
    if (session.payment_status === 'paid' && listing.payment_status !== 'PAID') {
      const paidAt = new Date();
      const expiresAt = new Date(paidAt.getTime() + (listing.listing_duration_days || 30) * 24 * 60 * 60 * 1000);
      const { error: reconciliationError } = await adminSupabase
        .from('listings')
        .update({
          status: 'ACTIVE',
          payment_status: 'PAID',
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          paid_at: paidAt.toISOString(),
          published_at: paidAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', listing.id)
        .eq('user_id', authData.user.id);
      if (reconciliationError) throw reconciliationError;
      listing.payment_status = 'PAID';
      listing.status = 'ACTIVE';
      listing.expires_at = expiresAt.toISOString();
    }

    return response.status(200).json({
      paid: session.payment_status === 'paid' && listing.payment_status === 'PAID',
      status: listing.payment_status,
      listing: {
        id: listing.id,
        title: listing.title,
        listingFee: Number(listing.listing_fee),
        durationDays: listing.listing_duration_days || 30,
        expiresAt: listing.expires_at,
      },
    });
  } catch (error) {
    console.error('Stripe payment status failed', error);
    return response.status(500).json({ error: 'Der Zahlungsstatus konnte nicht geladen werden.' });
  }
}
