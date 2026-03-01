import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const getMessagesProcedure = protectedProcedure
  .input(z.object({
    conversationId: z.string(),
    limit: z.number().default(50),
    cursor: z.string().optional(), // ID of last message
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { conversationId, limit } = input;

    try {
      // Verify access first
      const convDoc = await db.collection("conversations").doc(conversationId).get();
      if (!convDoc.exists || !convDoc.data()?.participantIds?.[user.id]) {
          throw new Error("Not authorized");
      }

      let q = db.collection("messages")
        .where("conversationId", "==", conversationId)
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (input.cursor) {
          // Ideally retrieve snapshot of cursor doc, but here we assume simple paging or just load recent
          // For realtime chat, usually we load initial batch and then listen.
          // This tRPC route is for initial load.
      }

      const snapshot = await q.get();
      return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      })).reverse(); // Return oldest first for chat UI usually, or depend on UI

    } catch (error) {
      console.error("[Chat] Get Messages Failed:", error);
      throw new Error("Failed to load messages");
    }
  });
