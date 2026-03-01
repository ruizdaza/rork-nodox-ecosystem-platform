import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { stripe } from "@/lib/stripe-server";

export const createPaymentIntentProcedure = protectedProcedure
  .input(z.object({
    amount: z.number().positive(),
    currency: z.string().default('cop'),
  }))
  .mutation(async ({ input, ctx }) => {
    const { amount, currency } = input;
    const { user } = ctx;

    console.log(`[Payments] Creating intent for user ${user.id}: ${amount} ${currency}`);

    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amounts in cents/smallest unit
        currency: currency.toLowerCase(),
        metadata: {
          userId: user.id,
          type: 'recharge', // Or 'purchase' depending on flow
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      };
    } catch (error) {
      console.error("[Payments] Create Intent Failed:", error);
      throw new Error("Failed to initialize payment");
    }
  });
