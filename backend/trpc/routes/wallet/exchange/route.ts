import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ExchangeResponse, NCOP_TO_COP_EXCHANGE_RATE, COP_TO_NCOP_EXCHANGE_RATE } from "@/types/wallet";
import { db } from "@/lib/firebase-server";
import { doc, runTransaction, collection } from "firebase/firestore";

export const exchangeProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      fromCurrency: z.enum(['NCOP', 'COP']),
      toCurrency: z.enum(['NCOP', 'COP']),
      amount: z.number().min(1, 'Monto debe ser mayor a 0'),
    })
  )
  .mutation(async ({ input, ctx }): Promise<ExchangeResponse> => {
    const userId = ctx.user.id;
    const { fromCurrency, toCurrency, amount } = input;

    if (fromCurrency === toCurrency) {
      throw new Error('No puedes intercambiar la misma moneda');
    }

    console.log(`[Wallet] Processing exchange for user: ${userId}`, { fromCurrency, toCurrency, amount });

    try {
      let exchangeRate: number;
      let toAmount: number;

      if (fromCurrency === 'NCOP' && toCurrency === 'COP') {
        exchangeRate = NCOP_TO_COP_EXCHANGE_RATE;
        toAmount = amount * exchangeRate;
      } else {
        exchangeRate = COP_TO_NCOP_EXCHANGE_RATE;
        toAmount = Math.floor(amount * exchangeRate);
      }

      if (toAmount < 1) {
        throw new Error('El monto a recibir debe ser mayor a 0');
      }

      const transactionId = `TXN-EXC-${Date.now()}`;
      const fee = 0;

      await runTransaction(db, async (transaction) => {
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await transaction.get(walletRef);

        if (!walletDoc.exists()) {
          throw new Error("Wallet not found");
        }

        const data = walletDoc.data();
        const currentFromBalance = fromCurrency === 'NCOP' ? (data.ncopBalance || 0) : (data.copBalance || 0);
        const currentToBalance = toCurrency === 'NCOP' ? (data.ncopBalance || 0) : (data.copBalance || 0);

        if (currentFromBalance < amount) {
          throw new Error(`Saldo insuficiente de ${fromCurrency}`);
        }

        const newFromBalance = currentFromBalance - amount;
        const newToBalance = currentToBalance + toAmount;

        // Update Wallet
        transaction.update(walletRef, {
          [fromCurrency === 'NCOP' ? 'ncopBalance' : 'copBalance']: newFromBalance,
          [toCurrency === 'NCOP' ? 'ncopBalance' : 'copBalance']: newToBalance,
          lastUpdated: new Date().toISOString()
        });

        // Record Transaction
        const txRef = doc(collection(db, "transactions"));
        transaction.set(txRef, {
          id: transactionId,
          userId,
          type: 'exchange',
          currency: fromCurrency, // Or handle as special exchange type with from/to
          amount: amount, // Amount spent
          balanceAfter: newFromBalance,
          description: `Intercambio de ${amount} ${fromCurrency} a ${toAmount} ${toCurrency}`,
          category: 'conversion',
          status: 'completed',
          metadata: {
            fromCurrency,
            toCurrency,
            exchangeRate,
            toAmount
          },
          createdAt: new Date().toISOString()
        });

      });

      const response: ExchangeResponse = {
        transactionId,
        fromAmount: amount,
        toAmount,
        exchangeRate,
        fee,
        status: 'completed',
      };

      console.log(`[Wallet] Exchange completed:`, response);
      return response;

    } catch (error) {
      console.error("[Wallet] Exchange failed:", error);
      throw new Error(error.message || "Exchange failed");
    }
  });
