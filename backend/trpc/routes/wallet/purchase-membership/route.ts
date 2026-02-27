import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

const MEMBERSHIP_PLANS = {
  plus: {
    priceNcop: 1000,
    durationMonths: 1,
    name: 'Plus'
  },
  premium: {
    priceNcop: 1800,
    durationMonths: 1,
    name: 'Premium'
  }
};

export const purchaseMembershipProcedure = protectedProcedure
  .input(z.object({
    planId: z.enum(['plus', 'premium']),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { planId } = input;
    const plan = MEMBERSHIP_PLANS[planId];

    console.log(`[Wallet] Purchasing membership ${planId} for user ${user.id}`);

    try {
      await db.runTransaction(async (t) => {
        const walletRef = db.collection("wallets").doc(user.id);
        const userRef = db.collection("users").doc(user.id);

        const walletDoc = await t.get(walletRef);
        const userDoc = await t.get(userRef);

        if (!walletDoc.exists) throw new Error("Wallet not found");
        if (!userDoc.exists) throw new Error("User not found");

        const currentNcop = walletDoc.data()?.ncopBalance || 0;

        if (currentNcop < plan.priceNcop) {
          throw new Error(`Saldo insuficiente. Requieres ${plan.priceNcop} NCOP.`);
        }

        // Calculate new expiration
        const now = new Date();
        const currentExpiresAt = userDoc.data()?.membershipExpiresAt
          ? new Date(userDoc.data()?.membershipExpiresAt)
          : now;

        // If expired, start from now. If active, extend.
        const startDate = currentExpiresAt > now ? currentExpiresAt : now;
        const newExpiresAt = new Date(startDate);
        newExpiresAt.setMonth(newExpiresAt.getMonth() + plan.durationMonths);

        // Deduct Balance
        t.update(walletRef, {
          ncopBalance: currentNcop - plan.priceNcop,
          lastUpdated: new Date().toISOString()
        });

        // Update User Membership
        t.update(userRef, {
          membershipType: planId,
          membershipExpiresAt: newExpiresAt.toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Record Transaction
        const txRef = db.collection("transactions").doc();
        t.set(txRef, {
          id: txRef.id,
          userId: user.id,
          type: 'spend',
          currency: 'NCOP',
          amount: plan.priceNcop,
          balanceAfter: currentNcop - plan.priceNcop,
          description: `Compra de Membresía ${plan.name}`,
          category: 'purchase',
          status: 'completed',
          metadata: {
            planId,
            durationMonths: plan.durationMonths
          },
          createdAt: new Date().toISOString()
        });
      });

      return { success: true };

    } catch (error: any) {
      console.error("[Wallet] Purchase Membership Failed:", error);
      throw new Error(error.message || "Failed to purchase membership");
    }
  });
