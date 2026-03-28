import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const createPaymentIntentProcedure = protectedProcedure
  .input(z.object({
    amount: z.number().positive(),
    currency: z.string().min(3).max(3),
    paymentMethodId: z.string(),
    gatewayId: z.string(),
    metadata: z.record(z.string(), z.any()).optional()
  }))
  .mutation(async ({ input }: { input: any }) => {
    console.log('Creating payment intent:', input);
    
    const paymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: input.amount,
      currency: input.currency,
      status: 'pending' as const,
      paymentMethodId: input.paymentMethodId,
      gatewayId: input.gatewayId,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        userId: 'current_user_id',
        description: 'Payment via NodoX API',
        ...input.metadata
      },
      fraudScore: Math.random() * 100,
      riskLevel: 'low' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: paymentIntent
    };
  });