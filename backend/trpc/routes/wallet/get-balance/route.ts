import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletBalance } from "@/types/wallet";
import { db } from "@/lib/firebase-server";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getBalanceProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(), // Optional now as we prefer ctx.user.id
    })
  )
  .query(async ({ ctx }): Promise<WalletBalance> => {
    const userId = ctx.user.id;

    console.log(`[Wallet] Getting balance for user: ${userId}`);

    try {
      const walletRef = doc(db, "wallets", userId);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        return {
          ncop: data.ncopBalance || 0,
          cop: data.copBalance || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };
      } else {
        // Initialize wallet if it doesn't exist
        const newWallet = {
          ncopBalance: 0,
          copBalance: 0,
          lastUpdated: new Date().toISOString(),
          userId: userId,
        };
        await setDoc(walletRef, newWallet);
        return {
          ncop: 0,
          cop: 0,
          lastUpdated: newWallet.lastUpdated,
        };
      }
    } catch (error) {
      console.error("[Wallet] Error fetching balance from Firestore:", error);
      // Fallback or rethrow
      throw new Error("Failed to fetch wallet balance");
    }
  });
