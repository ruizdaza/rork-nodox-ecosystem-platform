import Stripe from 'stripe';

// Use server-side only environment variable
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // Fail hard in production if missing
  if (process.env.NODE_ENV === 'production') {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }
  console.warn("Missing STRIPE_SECRET_KEY, payment operations will fail.");
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy', {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});
