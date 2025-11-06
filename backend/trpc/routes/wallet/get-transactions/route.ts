import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { WalletTransaction, TransactionFilter } from "@/types/wallet";

export const getTransactionsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(['earn', 'spend', 'send', 'receive', 'recharge', 'withdraw', 'exchange', 'refund', 'bonus', 'commission']).optional(),
      currency: z.enum(['NCOP', 'COP']).optional(),
      status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .query(async ({ input }): Promise<{ transactions: WalletTransaction[]; total: number; hasMore: boolean }> => {
    const { userId, type, currency, status, limit, offset } = input;

    console.log(`[Wallet] Getting transactions for user: ${userId}`, { type, currency, status, limit, offset });

    const mockTransactions: WalletTransaction[] = [
      {
        id: '1',
        userId,
        type: 'earn',
        currency: 'NCOP',
        amount: 120,
        balanceAfter: 2450,
        description: 'Compra en Restaurante El Sabor',
        category: 'cashback',
        status: 'completed',
        metadata: {
          orderId: 'ORD-001',
          productName: 'Almuerzo Ejecutivo',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId,
        type: 'spend',
        currency: 'NCOP',
        amount: 300,
        balanceAfter: 2330,
        description: 'Canje descuento Tienda Fashion',
        category: 'purchase',
        status: 'completed',
        metadata: {
          orderId: 'ORD-002',
          productName: 'Camisa Premium',
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        userId,
        type: 'receive',
        currency: 'COP',
        amount: 50000,
        balanceAfter: 150000,
        description: 'Transferencia de Carlos Mendoza',
        category: 'transfer',
        status: 'completed',
        metadata: {
          senderId: 'user-002',
          senderName: 'Carlos Mendoza',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        userId,
        type: 'bonus',
        currency: 'NCOP',
        amount: 500,
        balanceAfter: 2830,
        description: 'Referido exitoso',
        category: 'referral',
        status: 'completed',
        metadata: {
          referralId: 'REF-001',
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        userId,
        type: 'recharge',
        currency: 'COP',
        amount: 100000,
        balanceAfter: 100000,
        description: 'Recarga con PSE',
        category: 'top_up',
        status: 'completed',
        metadata: {
          paymentMethod: 'PSE',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    let filtered = mockTransactions;

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (currency) {
      filtered = filtered.filter(t => t.currency === currency);
    }
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      transactions: paginated,
      total,
      hasMore,
    };
  });
