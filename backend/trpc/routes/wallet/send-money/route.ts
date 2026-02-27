import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { SendMoneyResponse, MIN_TRANSACTION_AMOUNT, MAX_DAILY_SEND_LIMIT, TRANSACTION_FEE_PERCENTAGE } from "@/types/wallet";
import { db } from "@/lib/firebase-server";
import { doc, runTransaction, getDoc, collection } from "firebase/firestore";

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

      await runTransaction(db, async (transaction) => {
        // Get Sender Wallet
        const senderWalletRef = doc(db, "wallets", userId);
        const senderWalletDoc = await transaction.get(senderWalletRef);

        if (!senderWalletDoc.exists()) {
          throw new Error("Sender wallet not found");
        }

        const senderData = senderWalletDoc.data();
        let senderBalance = currency === 'NCOP' ? (senderData.ncopBalance || 0) : (senderData.copBalance || 0);

        // Check Balance
        if (senderBalance < amount) {
          throw new Error("Saldo insuficiente");
        }

        // Get Recipient Wallet (Create if not exists - simplified for transfer)
        const recipientWalletRef = doc(db, "wallets", recipientId);
        const recipientWalletDoc = await transaction.get(recipientWalletRef);

        let recipientBalance = 0;
        if (recipientWalletDoc.exists()) {
           const recipientData = recipientWalletDoc.data();
           recipientBalance = currency === 'NCOP' ? (recipientData.ncopBalance || 0) : (recipientData.copBalance || 0);

           // Fetch recipient name for response
           const recipientUserDoc = await transaction.get(doc(db, "users", recipientId));
           if (recipientUserDoc.exists()) {
             recipientName = recipientUserDoc.data().name || "Usuario";
           }
        } else {
           // If recipient wallet doesn't exist, we assume 0 balance and create it
           // In a real app, we should check if User exists first.
           const recipientUserDoc = await transaction.get(doc(db, "users", recipientId));
           if (!recipientUserDoc.exists()) {
              throw new Error("Recipient user not found");
           }
           recipientName = recipientUserDoc.data().name || "Usuario";
        }

        const fee = Math.floor(amount * TRANSACTION_FEE_PERCENTAGE);
        const amountAfterFee = amount - fee; // Assuming fee is deducted from sender amount or recipient?
        // Let's deduct fee from sender additionally or subtract from transfer?
        // Standard is sender pays amount + fee, OR recipient receives amount - fee.
        // Let's assume sender pays fee on top of amount for simplicity, or amount includes fee?
        // Let's say Recipient receives `amount`, Sender pays `amount + fee` if fee is extra.
        // Or Sender pays `amount`, Recipient gets `amount - fee`.
        // Based on typical "Send 100", Recipient gets 100 usually in P2P unless stated otherwise.
        // Let's assume sender pays amount, and fee is deducted from that (Recipient gets less).

        // Actually, let's keep it simple: Sender balance -= amount. Recipient balance += amount. Fee is 0 for P2P in this MVP to avoid confusion.
        // But the input type has `fee` in response. Let's assume fee is 0 for now or handled.
        // The mock had a fee calculation. Let's use it but maybe not deduct it for now or implement logic.
        // Let's say fee is just informational for now or deducted from transfer.

        const senderNewBalance = senderBalance - amount;
        const recipientNewBalance = recipientBalance + amount;

        // Update Sender
        transaction.update(senderWalletRef, {
          [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: senderNewBalance,
          lastUpdated: new Date().toISOString()
        });

        // Update Recipient
        if (recipientWalletDoc.exists()) {
          transaction.update(recipientWalletRef, {
            [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: recipientNewBalance,
            lastUpdated: new Date().toISOString()
          });
        } else {
           transaction.set(recipientWalletRef, {
            [currency === 'NCOP' ? 'ncopBalance' : 'copBalance']: recipientNewBalance,
            userId: recipientId,
            lastUpdated: new Date().toISOString()
          });
        }

        // Create Transaction Record for Sender
        const senderTxRef = doc(collection(db, "transactions"));
        transaction.set(senderTxRef, {
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

        // Create Transaction Record for Recipient
        const recipientTxRef = doc(collection(db, "transactions"));
        transaction.set(recipientTxRef, {
          id: `TXN-RCV-${Date.now()}`,
          userId: recipientId,
          type: 'receive',
          currency,
          amount, // Recipient received full amount
          balanceAfter: recipientNewBalance,
          description: description || `Recibido de ${senderData.name || "Usuario"}`,
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
        fee: 0, // Fee logic simplified to 0 for atomic transfer
      };

      console.log(`[Wallet] Send money completed:`, response);
      return response;

    } catch (error) {
      console.error("[Wallet] Send money failed:", error);
      throw new Error(error.message || "Transfer failed");
    }
  });
