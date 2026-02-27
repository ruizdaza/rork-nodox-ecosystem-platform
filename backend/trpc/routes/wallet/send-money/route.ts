import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { SendMoneyResponse, MIN_TRANSACTION_AMOUNT, MAX_DAILY_SEND_LIMIT, TRANSACTION_FEE_PERCENTAGE } from "@/types/wallet";
import { db } from "@/lib/firebase-server";

export const sendMoneyProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      recipientId: z.string(),
      amount: z.number().min(MIN_TRANSACTION_AMOUNT, 'Monto mínimo es 1,000'),
      currency: z.enum(['NCOP', 'COP']),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }): Promise<SendMoneyResponse> => {
    const userId = ctx.user.id;
    const { recipientId, amount, currency, description } = input;

    if (userId === recipientId) {
      throw new Error('No puedes enviarte dinero a ti mismo');
    }

    const copAmount = currency === 'NCOP' ? amount * 100 : amount;
    if (copAmount > MAX_DAILY_SEND_LIMIT) {
      throw new Error(`Límite diario de envío excedido. Máximo: ${MAX_DAILY_SEND_LIMIT.toLocaleString()} COP`);
    }

    console.log(`[Wallet] Processing send money from ${userId} to ${recipientId}`, { amount, currency, description });

    try {
      const transactionId = `TXN-SND-${Date.now()}`;
      let recipientName = "Usuario";

      await db.runTransaction(async (t) => {
        const senderWalletRef = db.collection("wallets").doc(userId);
        const senderWalletDoc = await t.get(senderWalletRef);

        if (!senderWalletDoc.exists) {
          throw new Error("Sender wallet not found");
        }

        const senderData = senderWalletDoc.data();
        let senderBalance = currency === 'NCOP' ? (senderData?.ncopBalance || 0) : (senderData?.copBalance || 0);

        if (senderBalance < amount) {
          throw new Error("Saldo insuficiente");
        }

        const recipientWalletRef = db.collection("wallets").doc(recipientId);
        const recipientWalletDoc = await t.get(recipientWalletRef);

        let recipientBalance = 0;
        if (recipientWalletDoc.exists) {
           const recipientData = recipientWalletDoc.data();
           recipientBalance = currency === 'NCOP' ? (recipientData?.ncopBalance || 0) : (recipientData?.copBalance || 0);

           const recipientUserDoc = await t.get(db.collection("users").doc(recipientId));
           if (recipientUserDoc.exists) {
             recipientName = recipientUserDoc.data()?.name || "Usuario";
           }
        } else {
           const recipientUserDoc = await t.get(db.collection("users").doc(recipientId));
           if (!recipientUserDoc.exists) {
              throw new Error("Recipient user not found");
           }
           recipientName = recipientUserDoc.data()?.name || "Usuario";
        }

        const senderNewBalance = senderBalance - amount;
        const recipientNewBalance = recipientBalance + amount;

        t.update(senderWalletRef, {
          [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: senderNewBalance,
          lastUpdated: new Date().toISOString()
        });

        if (recipientWalletDoc.exists) {
          t.update(recipientWalletRef, {
            [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: recipientNewBalance,
            lastUpdated: new Date().toISOString()
          });
        } else {
           t.set(recipientWalletRef, {
            [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: recipientNewBalance,
            userId: recipientId,
            lastUpdated: new Date().toISOString()
          });
        }

        const senderTxRef = db.collection("transactions").doc(transactionId);
        t.set(senderTxRef, {
          id: transactionId,
          userId,
          type: 'send',
          currency,
          amount,
          balanceAfter: senderNewBalance,
          description: description || `Envío a ${recipientName}`,
          category: 'transfer',
          status: 'completed',
          metadata: { recipientId, recipientName },
          createdAt: new Date().toISOString()
        });

        const recipientTxRef = db.collection("transactions").doc(`TXN-RCV-${Date.now()}`);
        t.set(recipientTxRef, {
          id: recipientTxRef.id,
          userId: recipientId,
          type: 'receive',
          currency,
          amount,
          balanceAfter: recipientNewBalance,
          description: description || `Recibido de ${senderData?.name || "Usuario"}`,
          category: 'transfer',
          status: 'completed',
          metadata: { senderId: userId },
          createdAt: new Date().toISOString()
        });

      });

      const response: SendMoneyResponse = {
        transactionId,
        status: 'completed',
        amount,
        recipientName,
        fee: 0,
      };

      console.log(`[Wallet] Send money completed:`, response);
      return response;

    } catch (error: any) {
      console.error("[Wallet] Send money failed:", error);
      throw new Error(error.message || "Transfer failed");
    }
  });
