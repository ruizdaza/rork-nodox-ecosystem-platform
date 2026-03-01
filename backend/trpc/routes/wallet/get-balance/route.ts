import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletBalance } from "@/types/wallet";
import { db } from "@/lib/firebase-server";

export const getBalanceProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    })
  )
  .query(async ({ ctx }): Promise<WalletBalance> => {
    const userId = ctx.user.id;

    console.log(`[Wallet] Getting balance for user: ${userId}`);

    try {
      const walletDoc = await db.collection("wallets").doc(userId).get();

      if (walletDoc.exists) {
        const data = walletDoc.data();
        return {
          ncop: data?.ncopBalance || 0,
          cop: data?.copBalance || 0,
          lastUpdated: data?.lastUpdated || new Date().toISOString(),
        };
      } else {
        const newWallet = {
          ncopBalance: 0,
          copBalance: 0,
          lastUpdated: new Date().toISOString(),
          userId: userId,
        };
        await db.collection("wallets").doc(userId).set(newWallet);
        return {
          ncop: 0,
          cop: 0,
          lastUpdated: newWallet.lastUpdated,
        };
      }
    } catch (error) {
      console.error("[Wallet] Error fetching balance from Firestore:", error);
      throw new Error("Failed to fetch wallet balance");
    }
  });
