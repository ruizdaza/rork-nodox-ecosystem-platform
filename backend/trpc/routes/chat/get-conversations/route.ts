import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const getConversationsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(20),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;

    try {
      // Query where participantIds map contains key user.id
      // Firestore Map query: where(`participantIds.${user.id}`, "==", true)

      const snapshot = await db.collection("conversations")
        .where(`participantIds.${user.id}`, "==", true)
        .orderBy("updatedAt", "desc")
        .limit(input.limit)
        .get();

      return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      }));

    } catch (error) {
      console.error("[Chat] Get Conversations Failed:", error);
      throw new Error("Failed to load conversations");
    }
  });
