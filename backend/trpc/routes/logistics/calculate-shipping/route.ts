import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const calculateShippingProcedure = protectedProcedure
  .input(z.object({
    origin: z.object({
      name: z.string(),
      line1: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
      isResidential: z.boolean()
    }),
    destination: z.object({
      name: z.string(),
      line1: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
      isResidential: z.boolean()
    }),
    package: z.object({
      weight: z.number().positive(),
      dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive()
      }),
      value: z.number().positive(),
      currency: z.string(),
      description: z.string()
    }),
    serviceTypes: z.array(z.enum(['standard', 'express', 'overnight', 'same_day'])).optional()
  }))
  .mutation(async ({ input }: { input: any }) => {
    console.log('Calculating shipping quotes:', input);
    
    const mockQuotes = [
      {
        id: `quote_coordinadora_${Date.now()}`,
        carrierId: 'coordinadora',
        serviceId: 'coord_standard',
        cost: 8000 + (input.package.weight * 2000),
        currency: 'COP',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        transitTime: '2-5 días',
        metadata: {
          carrierName: 'Coordinadora',
          serviceName: 'Envío Estándar'
        }
      },
      {
        id: `quote_servientrega_${Date.now()}`,
        carrierId: 'servientrega',
        serviceId: 'servi_standard',
        cost: 7500 + (input.package.weight * 1800),
        currency: 'COP',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        transitTime: '3-7 días',
        metadata: {
          carrierName: 'Servientrega',
          serviceName: 'Envío Nacional'
        }
      }
    ];

    return {
      success: true,
      data: mockQuotes.sort((a, b) => a.cost - b.cost)
    };
  });