import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { SendMoneyResponse, MIN_TRANSACTION_AMOUNT, MAX_DAILY_SEND_LIMIT, TRANSACTION_FEE_PERCENTAGE } from "@/types/wallet";

export const sendMoneyProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      recipientId: z.string(),
      amount: z.number().min(MIN_TRANSACTION_AMOUNT, 'Monto mínimo es 1,000'),
      currency: z.enum(['NCOP', 'COP']),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input }): Promise<SendMoneyResponse> => {
    const { userId, recipientId, amount, currency, description } = input;

    if (userId === recipientId) {
      throw new Error('No puedes enviarte dinero a ti mismo');
    }

    const copAmount = currency === 'NCOP' ? amount * 100 : amount;
    if (copAmount > MAX_DAILY_SEND_LIMIT) {
      throw new Error(`Límite diario de envío excedido. Máximo: ${MAX_DAILY_SEND_LIMIT.toLocaleString()} COP`);
    }

    console.log(`[Wallet] Processing send money from ${userId} to ${recipientId}`, { amount, currency, description });

    const fee = Math.floor(amount * TRANSACTION_FEE_PERCENTAGE);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockRecipients: Record<string, string> = {
      '2': 'Carlos Mendoza',
      '3': 'Laura Pérez',
      '4': 'Ana Rodríguez',
    };

    const recipientName = mockRecipients[recipientId] || 'Usuario Desconocido';

    const response: SendMoneyResponse = {
      transactionId: `TXN-SND-${Date.now()}`,
      status: 'completed',
      amount,
      recipientName,
      fee,
    };

    console.log(`[Wallet] Send money completed:`, response);

    return response;
  });
