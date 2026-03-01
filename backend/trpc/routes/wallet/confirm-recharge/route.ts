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
      const result = await processRechargeConfirmation(paymentIntentId, user.id);

      return {
          status: result.status,
      };

    } catch (error: any) {
      console.error("[Wallet] Confirm Recharge Failed:", error);
      throw new Error(error.message || "Failed to confirm recharge");
    }
  });
