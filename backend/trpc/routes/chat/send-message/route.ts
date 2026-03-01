import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

export const sendMessageProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
    text: z.string().min(1),
    type: z.enum(['text', 'image', 'location']).default('text'),
    metadata: z.record(z.any()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { conversationId, text, type, metadata } = input;

    try {
      const convRef = db.collection("conversations").doc(conversationId);

      // Verify participation
      // Optimization: Assume client is correct, rules/backend check later if critical.
      // Here we check if doc exists and user is in it.
      const convDoc = await convRef.get();
      if (!convDoc.exists) throw new Error("Conversation not found");
      const convData = convDoc.data();
      if (!convData?.participantIds?.[user.id]) throw new Error("Not authorized");

      const messageData = {
          conversationId,
          senderId: user.id,
          text,
          type,
          metadata: metadata || {},
          createdAt: new Date().toISOString(),
          readBy: { [user.id]: true }
      };

      const msgRef = await db.collection("messages").add(messageData);

      // Update Conversation Last Message
      await convRef.update({
          lastMessage: {
              text: type === 'image' ? '📷 Imagen' : text,
              senderId: user.id,
              createdAt: new Date().toISOString(),
              read: false
          },
          updatedAt: new Date().toISOString()
      });

      return { id: msgRef.id, ...messageData };

    } catch (error) {
      console.error("[Chat] Send Message Failed:", error);
      throw new Error("Failed to send message");
    }
  });
