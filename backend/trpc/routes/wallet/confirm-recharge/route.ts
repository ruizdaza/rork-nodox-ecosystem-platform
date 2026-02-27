import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { processRechargeConfirmation } from "@/backend/webhooks/stripe";

export const confirmRechargeProcedure = protectedProcedure
  .input(z.object({
    paymentIntentId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { paymentIntentId } = input;
    const { user } = ctx;

    console.log(`[Wallet] Confirming recharge for user ${user.id} with intent ${paymentIntentId}`);

    try {
      // Reuse logic shared with webhook
      // If it's already processed by webhook, this returns "already_processed"
      const result = await processRechargeConfirmation(paymentIntentId, user.id);

      // In a real app we'd fetch the new balance here to return it,
      // but for now we trust the client will refresh or we return a placeholder
      // if result doesn't have it (webhook function returns simplified status)

      return {
          status: result.status,
          // newBalance would ideally be fetched here if needed by UI immediate update
      };

    } catch (error) {
      console.error("[Wallet] Confirm Recharge Failed:", error);
      throw new Error(error.message || "Failed to confirm recharge");
    }
  });
