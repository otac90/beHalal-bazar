import { ensureStripeConfiguration, getAdminSupabase, getStripe } from './_stripe.js';

export const config = { api: { bodyParser: false } };

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  rawBody?: Buffer;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
}

const getHeader = (request: RequestLike, name: string) => {
  const value = request.headers[name] || request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    ensureStripeConfiguration();
    const stripe = await getStripe();
    const adminSupabase = await getAdminSupabase();
    const signature = getHeader(request, 'stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !secret) return response.status(400).json({ error: 'Webhook ist nicht konfiguriert.' });

    const rawPayload = request.rawBody || Buffer.from(typeof request.body === 'string' ? request.body : JSON.stringify(request.body));
    const event = stripe.webhooks.constructEvent(rawPayload, signature, secret);
    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
      return response.status(200).json({ received: true });
    }

    const session = event.data.object as { payment_status: string | null; metadata?: Record<string, string>; payment_intent?: string | null };
    if (session.payment_status !== 'paid') return response.status(200).json({ received: true });
    const listingId = session.metadata?.listing_id;
    const userId = session.metadata?.user_id;
    if (!listingId || !userId) return response.status(400).json({ error: 'Webhook-Metadaten fehlen.' });

    const { data: listing, error: listingError } = await adminSupabase
      .from('listings')
      .select('id, user_id, listing_duration_days, payment_status')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single();
    if (listingError || !listing) return response.status(404).json({ error: 'Inserat nicht gefunden.' });
    if (listing.payment_status === 'PAID') return response.status(200).json({ received: true });

    const paidAt = new Date();
    const expiresAt = new Date(paidAt.getTime() + (listing.listing_duration_days || 30) * 24 * 60 * 60 * 1000);
    const { error: updateError } = await adminSupabase
      .from('listings')
      .update({
        status: 'ACTIVE',
        payment_status: 'PAID',
        stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        paid_at: paidAt.toISOString(),
        published_at: paidAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', listingId)
      .eq('user_id', userId);
    if (updateError) throw updateError;

    return response.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failed', error);
    return response.status(400).json({ error: 'Ungültiger Stripe-Webhook.' });
  }
}
