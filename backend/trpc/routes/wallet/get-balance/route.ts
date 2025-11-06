import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletBalance } from "@/types/wallet";

export const getBalanceProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }): Promise<WalletBalance> => {
    const { userId } = input;

    console.log(`[Wallet] Getting balance for user: ${userId}`);

    const mockBalance: WalletBalance = {
      ncop: 2450,
      cop: 150000,
      lastUpdated: new Date().toISOString(),
    };

    return mockBalance;
  });
