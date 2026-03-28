import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const getChatsProcedure = protectedProcedure
  .input(
    z.object({
      userType: z.enum(['user', 'ally', 'admin']).optional(),
      includeArchived: z.boolean().optional().default(false),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log('[tRPC] get-chats called:', input);
    
    const currentUserId = ctx.user?.id || 'current-user';
    
    // En producción, esto consultaría la base de datos
    // Filtrando por participantIds que incluyan currentUserId
    
    return {
      success: true,
      chats: [],
      userType: input.userType || 'user',
    };
  });