import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const getAddressesProcedure = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx }) => {
    const { user } = ctx;
    console.log(`[User] Fetching addresses for: ${user.id}`);

    try {
      const snapshot = await db.collection("users")
        .doc(user.id)
        .collection("addresses")
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error("[User] Fetch Addresses Failed:", error);
      throw new Error("Failed to fetch addresses");
    }
  });
