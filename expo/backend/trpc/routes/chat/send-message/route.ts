import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const sendMessageProcedure = protectedProcedure
  .input(
    z.object({
      chatId: z.string(),
      content: z.string(),
      type: z.enum(['text', 'image', 'audio', 'file', 'video_call', 'scheduled']),
      recipientId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] send-message called:', input);
    
    // Aquí se integraría con una base de datos real
    // Por ahora, simulamos el envío del mensaje
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId: input.chatId,
      senderId: ctx.user?.id || 'current-user',
      content: input.content,
      type: input.type,
      timestamp: new Date(),
      isRead: false,
      isDeleted: false,
      isEdited: false,
    };

    console.log('[tRPC] Message created:', message);
    
    return {
      success: true,
      message,
    };
  });