import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const getMessagesProcedure = protectedProcedure
  .input(
    z.object({
      chatId: z.string(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log('[tRPC] get-messages called:', input);
    
    // En producción, esto consultaría la base de datos
    // Filtrando mensajes por chatId con paginación
    
    return {
      success: true,
      messages: [],
      hasMore: false,
    };
  });