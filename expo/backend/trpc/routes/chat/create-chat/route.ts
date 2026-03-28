import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const createChatProcedure = protectedProcedure
  .input(
    z.object({
      participantIds: z.array(z.string()),
      type: z.enum(['individual', 'group', 'support', 'ally_client']),
      name: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[tRPC] create-chat called:', input);
    
    const currentUserId = ctx.user?.id || 'current-user';
    const allParticipants = [currentUserId, ...input.participantIds];
    
    const newChat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: input.type,
      name: input.name,
      participants: allParticipants,
      unreadCount: 0,
      isArchived: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowFileSharing: true,
        allowImageSharing: true,
        allowAudioMessages: true,
        allowVideoCalls: true,
        allowLargeFiles: true,
        allowScheduledMessages: true,
        maxFileSize: 10,
        requireApprovalToJoin: false,
        onlyAdminsCanMessage: false,
      },
    };

    console.log('[tRPC] Chat created:', newChat);
    
    return {
      success: true,
      chat: newChat,
    };
  });