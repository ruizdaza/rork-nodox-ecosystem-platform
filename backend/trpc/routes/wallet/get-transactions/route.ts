import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletTransaction, TransactionFilter } from "@/types/wallet";
import { db } from "@/lib/firebase-server";
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs, startAfter } from "firebase/firestore";

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
      const transactionsRef = collection(db, "transactions");
      let q = query(transactionsRef, where("userId", "==", userId));

      if (type) {
        q = query(q, where("type", "==", type));
      }
      if (currency) {
        q = query(q, where("currency", "==", currency));
      }
      if (status) {
        q = query(q, where("status", "==", status));
      }

      // Order by createdAt desc
      q = query(q, orderBy("createdAt", "desc"));

      // Fetch limit + 1 to check for hasMore
      const fetchLimit = limit + 1;
      // We still need to fetch enough to cover offset if we aren't using cursors properly yet.
      // Ideally client passes lastId for cursor pagination.
      // With offset, we have to read everything up to offset+limit.
      q = query(q, firestoreLimit(offset + fetchLimit));

      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTransaction));

      // Slice manually for offset
      const paginated = allDocs.slice(offset, offset + limit);

      // hasMore check: if we have more docs in total than (offset + limit)
      const hasMore = allDocs.length > offset + limit;

      return {
        transactions: paginated,
        total: allDocs.length, // Returning count of fetched docs as proxy for "known total" so far
        hasMore,
      };

    } catch (error) {
       console.error("[Wallet] Error fetching transactions:", error);
       return { transactions: [], total: 0, hasMore: false };
    }
  });
