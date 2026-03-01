import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletTransaction, TransactionFilter } from "@/types/wallet";
import { db } from "@/lib/firebase-server";

export const getTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      type: z.enum(['earn', 'spend', 'send', 'receive', 'recharge', 'withdraw', 'exchange', 'refund', 'bonus', 'commission']).optional(),
      currency: z.enum(['NCOP', 'COP']).optional(),
      status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input, ctx }): Promise<{ transactions: WalletTransaction[]; total: number; hasMore: boolean }> => {
    const userId = ctx.user.id;
    const { type, currency, status, limit, offset } = input;

    console.log(`[Wallet] Getting transactions for user: ${userId}`, { type, currency, status, limit, offset });

    try {
      let query = db.collection("transactions").where("userId", "==", userId);

      if (type) {
        query = query.where("type", "==", type);
      }
      if (currency) {
        query = query.where("currency", "==", currency);
      }
      if (status) {
        query = query.where("status", "==", status);
      }

      query = query.orderBy("createdAt", "desc");

      const fetchLimit = limit + 1;
      // Admin SDK uses offset() directly
      query = query.offset(offset).limit(fetchLimit);

      const querySnapshot = await query.get();
      const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTransaction));

      const paginated = allDocs.slice(0, limit);
      const hasMore = allDocs.length > limit;

      return {
        transactions: paginated,
        total: allDocs.length + offset, // Proxy total
        hasMore,
      };

    } catch (error) {
       console.error("[Wallet] Error fetching transactions:", error);
       return { transactions: [], total: 0, hasMore: false };
    }
  });
