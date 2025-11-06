import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { ExchangeResponse, NCOP_TO_COP_EXCHANGE_RATE, COP_TO_NCOP_EXCHANGE_RATE, MIN_TRANSACTION_AMOUNT } from "@/types/wallet";

export const exchangeProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      fromCurrency: z.enum(['NCOP', 'COP']),
      toCurrency: z.enum(['NCOP', 'COP']),
      amount: z.number().min(1, 'Monto debe ser mayor a 0'),
    })
  )
  .mutation(async ({ input }): Promise<ExchangeResponse> => {
    const { userId, fromCurrency, toCurrency, amount } = input;

    if (fromCurrency === toCurrency) {
      throw new Error('No puedes intercambiar la misma moneda');
    }

    console.log(`[Wallet] Processing exchange for user: ${userId}`, { fromCurrency, toCurrency, amount });

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

    const fee = 0;

    await new Promise(resolve => setTimeout(resolve, 800));

    const response: ExchangeResponse = {
      transactionId: `TXN-EXC-${Date.now()}`,
      fromAmount: amount,
      toAmount,
      exchangeRate,
      fee,
      status: 'completed',
    };

    console.log(`[Wallet] Exchange completed:`, response);

    return response;
  });
