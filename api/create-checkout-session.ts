import { ensureStripeConfiguration, getAdminSupabase, getAppUrl, getBearerToken, getStripe } from './_stripe';

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
    ensureStripeConfiguration();
    const stripe = await getStripe();
    const adminSupabase = await getAdminSupabase();
    const token = getBearerToken(request);
    if (!token) return response.status(401).json({ error: 'Nicht angemeldet.' });

    const { data: authData, error: authError } = await adminSupabase.auth.getUser(token);
    if (authError || !authData.user) return response.status(401).json({ error: 'Sitzung ungültig.' });

    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const listingId = body?.listingId;
    if (typeof listingId !== 'string') return response.status(400).json({ error: 'Inserat fehlt.' });

    const { data: listing, error: listingError } = await adminSupabase
      .from('listings')
      .select('id, user_id, title, listing_fee, listing_duration_days, payment_status, status')
      .eq('id', listingId)
      .eq('user_id', authData.user.id)
      .single();

    if (listingError || !listing) return response.status(404).json({ error: 'Inserat nicht gefunden.' });
    if (listing.status !== 'PENDING' || listing.payment_status !== 'PENDING') {
      return response.status(409).json({ error: 'Für dieses Inserat ist keine Zahlung mehr offen.' });
    }
    if (!Number.isFinite(Number(listing.listing_fee)) || Number(listing.listing_fee) <= 0) {
      return response.status(400).json({ error: 'Dieses Inserat ist kostenlos.' });
    }

    const appUrl = getAppUrl(request);
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: authData.user.email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(listing.listing_fee) * 100),
          product_data: {
            name: `Inserat: ${listing.title}`,
            description: `Online für ${listing.listing_duration_days || 30} Tage`,
          },
        },
      }],
      metadata: { listing_id: listing.id, user_id: authData.user.id },
      payment_intent_data: { metadata: { listing_id: listing.id, user_id: authData.user.id } },
      success_url: `${appUrl}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?stripe=cancel&listing_id=${encodeURIComponent(listing.id)}`,
    });

    await adminSupabase.from('listings').update({ stripe_checkout_session_id: checkout.id }).eq('id', listing.id);
    return response.status(200).json({ url: checkout.url });
  } catch (error) {
    console.error('Stripe checkout creation failed', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : 'Checkout konnte nicht erstellt werden.' });
  }
}
