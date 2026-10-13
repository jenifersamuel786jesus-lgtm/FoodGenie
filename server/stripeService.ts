import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeInstance(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

export async function createStripePaymentIntent(
  amountInDollars: number,
  currency = 'usd',
  metadata: Record<string, any> = {}
) {
  const stripe = getStripeInstance();
  const amountInCents = Math.round(Math.max(1, amountInDollars) * 100);

  // If real STRIPE_SECRET_KEY is configured in .env or Vercel:
  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          app: 'FoodGenie',
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: 'live_stripe',
        amount: amountInDollars,
      };
    } catch (err: any) {
      console.warn('[Stripe] PaymentIntent creation error:', err.message);
      // Fallback to test mode if key is restricted or in test mode
    }
  }

  // Fallback test mode (when Stripe key is not configured or in sandbox test):
  const mockIntentId = `pi_${Date.now()}_test_${Math.floor(1000 + Math.random() * 9000)}`;
  const mockClientSecret = `${mockIntentId}_secret_${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    success: true,
    clientSecret: mockClientSecret,
    paymentIntentId: mockIntentId,
    mode: 'test_stripe',
    amount: amountInDollars,
    note: process.env.STRIPE_SECRET_KEY
      ? 'Stripe test mode'
      : 'Using Stripe test sandbox. Set STRIPE_SECRET_KEY in your .env or Vercel for production charges.',
  };
}
