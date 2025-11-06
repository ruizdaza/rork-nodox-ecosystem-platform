import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { TransactionStats } from "@/types/wallet";

export const getStatsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      currency: z.enum(['NCOP', 'COP']),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    })
  )
  .query(async ({ input }): Promise<TransactionStats> => {
    const { userId, currency, fromDate, toDate } = input;

    console.log(`[Wallet] Getting stats for user: ${userId}`, { currency, fromDate, toDate });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const mockStats: TransactionStats = currency === 'NCOP' ? {
      totalEarned: 1520,
      totalSpent: 850,
      totalSent: 200,
      totalReceived: 500,
      totalRecharged: 0,
      netFlow: 970,
      transactionCount: 28,
      averageTransaction: 125,
      largestTransaction: 500,
      currency: 'NCOP',
      period: {
        from: fromDate || thirtyDaysAgo.toISOString(),
        to: toDate || now.toISOString(),
      },
    } : {
      totalEarned: 250000,
      totalSpent: 180000,
      totalSent: 50000,
      totalReceived: 100000,
      totalRecharged: 300000,
      netFlow: 420000,
      transactionCount: 35,
      averageTransaction: 12857,
      largestTransaction: 100000,
      currency: 'COP',
      period: {
        from: fromDate || thirtyDaysAgo.toISOString(),
        to: toDate || now.toISOString(),
      },
    };

    return mockStats;
  });
