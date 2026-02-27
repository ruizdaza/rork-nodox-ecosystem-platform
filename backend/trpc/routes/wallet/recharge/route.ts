import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { RechargeResponse, RECHARGE_BONUS_PERCENTAGE, MIN_TRANSACTION_AMOUNT, MAX_DAILY_RECHARGE_LIMIT } from "@/types/wallet";
import { db } from "@/lib/firebase-server";
import { doc, runTransaction, serverTimestamp, collection, addDoc } from "firebase/firestore";

export const rechargeProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      amount: z.number().min(MIN_TRANSACTION_AMOUNT, 'Monto mínimo es 1,000 COP'),
      paymentMethod: z.enum(['PSE', 'CARD', 'BANK_TRANSFER']),
      returnUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }): Promise<RechargeResponse> => {
    const userId = ctx.user.id;
    const { amount, paymentMethod, returnUrl } = input;

    if (amount > MAX_DAILY_RECHARGE_LIMIT) {
      throw new Error(`Límite diario de recarga excedido. Máximo: ${MAX_DAILY_RECHARGE_LIMIT.toLocaleString()} COP`);
    }

    console.log(`[Wallet] Processing recharge for user: ${userId}`, { amount, paymentMethod });

    // Use Firestore transaction for atomicity
    try {
      const bonusNcop = Math.floor((amount * RECHARGE_BONUS_PERCENTAGE) / 100);
      const transactionId = `TXN-RCH-${Date.now()}`;

      await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await transaction.get(walletRef);

        let currentCop = 0;
        let currentNcop = 0;

        if (walletDoc.exists()) {
          const data = walletDoc.data();
          currentCop = data.copBalance || 0;
          currentNcop = data.ncopBalance || 0;
        }

        const newCop = currentCop + amount;
        const newNcop = currentNcop + bonusNcop;

        // Update Wallet
        transaction.set(walletRef, {
          copBalance: newCop,
          ncopBalance: newNcop,
          lastUpdated: new Date().toISOString(),
          userId: userId // Ensure userId is set
        }, { merge: true });

        // Create Transaction Record
        const transactionRef = doc(collection(db, "transactions"));
        transaction.set(transactionRef, {
          id: transactionId, // Using client generated ID for consistency with response, ideally use doc.id
          userId,
          type: 'recharge',
          currency: 'COP',
          amount,
          balanceAfter: newCop,
          description: `Recarga con ${paymentMethod}`,
          category: 'top_up',
          status: 'completed',
          metadata: {
            paymentMethod,
            bonusNcop
          },
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        });

        // If bonus given, create bonus transaction record
        if (bonusNcop > 0) {
           const bonusRef = doc(collection(db, "transactions"));
           transaction.set(bonusRef, {
            id: `TXN-BONUS-${Date.now()}`,
            userId,
            type: 'bonus',
            currency: 'NCOP',
            amount: bonusNcop,
            balanceAfter: newNcop,
            description: `Bonus por recarga`,
            category: 'reward',
            status: 'completed',
            metadata: {
              relatedTransactionId: transactionId
            },
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString()
          });
        }
      });

      const response: RechargeResponse = {
        transactionId,
        status: 'completed',
        amount,
        bonusNcop,
        paymentUrl: paymentMethod === 'PSE' ? `https://pse.example.com/pay?ref=${transactionId}` : undefined,
        expiresAt: paymentMethod === 'PSE' ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : undefined,
      };

      console.log(`[Wallet] Recharge completed:`, response);
      return response;

    } catch (error) {
      console.error("[Wallet] Recharge failed:", error);
      throw new Error("Recharge failed due to database error");
    }
  });
