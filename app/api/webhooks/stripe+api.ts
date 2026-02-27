import { handleStripeWebhook } from "@/backend/webhooks/stripe";

export async function POST(req: Request) {
  // Expo/Next.js API route adapter
  // We need to convert Request to a mock express-like req/res or handle directly
  // handleStripeWebhook expects req.headers and req.rawBody or buffer for signature verification

  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    // Mocking req/res for the shared handler logic
    // Ideally we refactor handleStripeWebhook to take (body, signature)
    // But let's inline a clean handler here for Expo API Route

    const { stripe } = await import("@/lib/stripe-server");
    const { processRechargeConfirmation } = await import("@/backend/webhooks/stripe");

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        return new Response('Webhook Secret Missing', { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await processRechargeConfirmation(paymentIntent.id, paymentIntent.metadata.userId);
    }

    return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Webhook Handler Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
