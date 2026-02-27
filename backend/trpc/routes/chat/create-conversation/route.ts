import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const createConversationProcedure = protectedProcedure
  .input(z.object({
    participantId: z.string(), // The other user (e.g., Seller)
    contextType: z.enum(['product', 'order', 'support']).optional(),
    contextId: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { participantId, contextType, contextId } = input;

    if (participantId === user.id) {
        throw new Error("Cannot chat with yourself");
    }

    try {
      // 1. Check if conversation exists
      // Query conversations where both users are participants.
      // Firestore array-contains is limited to one value.
      // We can use a composite ID "uid1_uid2" (sorted) for direct lookup if P2P only,
      // or query filtering. For this MVP, let's use a composite ID approach for P2P ease.
      // BUT if context matters (Product A vs Product B), we need separate chats?
      // "WhatsApp style" usually means ONE chat per pair.
      // "Marketplace style" might mean chat per product context.
      // Let's go with "Contextual" if context provided, otherwise P2P.

      const participants = [user.id, participantId].sort();
      let conversationId = participants.join('_');

      if (contextType && contextId) {
          conversationId = `${conversationId}_${contextType}_${contextId}`;
      }

      const convRef = db.collection("conversations").doc(conversationId);
      const convDoc = await convRef.get();

      if (!convDoc.exists) {
        // Fetch participant details for metadata (optional but nice for UI list)
        const partUserDoc = await db.collection("users").doc(participantId).get();
        const partName = partUserDoc.exists ? partUserDoc.data()?.name : "Usuario";

        await convRef.set({
            id: conversationId,
            participants: participants,
            participantIds: { [user.id]: true, [participantId]: true }, // For querying my chats
            context: contextType ? { type: contextType, id: contextId } : null,
            lastMessage: null,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metadata: {
                [user.id]: { name: user.name || 'Yo' }, // Snapshot of names
                [participantId]: { name: partName }
            }
        });
      }

      return { conversationId };

    } catch (error) {
      console.error("[Chat] Create Conversation Failed:", error);
      throw new Error("Failed to create conversation");
    }
  });
