import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

export const startChatWithLeadProcedure = protectedProcedure
  .input(
    z.object({
      leadId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] Start chat with lead called:', input);
    
    const chatId = `chat-referral-${input.leadId}-${Date.now()}`;
    const userId = `lead-user-${input.leadId}`;
    
    const welcomeMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: ctx.user.id,
      content: `¡Hola! 👋 Gracias por tu interés en NodoX. Estoy aquí para ayudarte en lo que necesites.`,
      type: 'text' as const,
      timestamp: new Date(),
      isRead: false,
    };
    
    console.log('[tRPC] Chat created with lead:', { chatId, userId });
    
    return {
      success: true,
      chatId,
      userId,
      message: welcomeMessage,
    };
  });

export const sendMessageToLeadProcedure = protectedProcedure
  .input(
    z.object({
      leadId: z.string(),
      message: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] Send message to lead called:', input);
    
    const userId = `lead-user-${input.leadId}`;
    const chatId = `chat-referral-${input.leadId}`;
    
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: ctx.user.id,
      content: input.message,
      type: 'text' as const,
      timestamp: new Date(),
      isRead: false,
    };
    
    console.log('[tRPC] Message sent to lead:', message);
    
    return {
      success: true,
      message,
    };
  });

export const notifyLeadConversionProcedure = protectedProcedure
  .input(
    z.object({
      leadId: z.string(),
      leadName: z.string(),
      commission: z.number(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] Notify lead conversion called:', input);
    
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: ctx.user.id,
      title: '🎉 ¡Lead Convertido!',
      body: `${input.leadName} se ha convertido en cliente. ¡Felicitaciones! Comisión ganada: ${input.commission} NCOP`,
      type: 'referral_success' as const,
      category: 'system' as const,
      priority: 'high' as const,
      data: {
        leadId: input.leadId,
        leadName: input.leadName,
        commission: input.commission,
      },
      timestamp: Date.now(),
      read: false,
    };
    
    console.log('[tRPC] Conversion notification created:', notification);
    
    return {
      success: true,
      notification,
    };
  });

export const sendBulkMessagesToLeadsProcedure = protectedProcedure
  .input(
    z.object({
      leadIds: z.array(z.string()),
      message: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] Send bulk messages to leads called:', input);
    
    const results = {
      success: 0,
      failed: 0,
      sentMessages: [] as any[],
      errors: [] as string[],
    };
    
    for (const leadId of input.leadIds) {
      try {
        const userId = `lead-user-${leadId}`;
        const chatId = `chat-referral-${leadId}`;
        
        const message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chatId,
          senderId: ctx.user.id,
          content: input.message,
          type: 'text' as const,
          timestamp: new Date(),
          isRead: false,
        };
        
        results.sentMessages.push({
          leadId,
          userId,
          message,
        });
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${leadId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    console.log('[tRPC] Bulk messages sent:', results);
    
    return {
      success: true,
      results,
    };
  });
