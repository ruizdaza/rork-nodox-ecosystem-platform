import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { RechargeResponse, RECHARGE_BONUS_PERCENTAGE, MIN_TRANSACTION_AMOUNT, MAX_DAILY_RECHARGE_LIMIT } from "@/types/wallet";

export const rechargeProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      amount: z.number().min(MIN_TRANSACTION_AMOUNT, 'Monto mínimo es 1,000 COP'),
      paymentMethod: z.enum(['PSE', 'CARD', 'BANK_TRANSFER']),
      returnUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }): Promise<RechargeResponse> => {
    const { userId, amount, paymentMethod, returnUrl } = input;

    if (amount > MAX_DAILY_RECHARGE_LIMIT) {
      throw new Error(`Límite diario de recarga excedido. Máximo: ${MAX_DAILY_RECHARGE_LIMIT.toLocaleString()} COP`);
    }

    console.log(`[Wallet] Processing recharge for user: ${userId}`, { amount, paymentMethod });

    const bonusNcop = Math.floor((amount * RECHARGE_BONUS_PERCENTAGE) / 100);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const transactionId = `TXN-RCH-${Date.now()}`;

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
  });
