import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const addAddressProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1), // e.g., "Home", "Office"
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    instructions: z.string().optional(),
    isDefault: z.boolean().optional().default(false),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    console.log(`[User] Adding address for: ${user.id}`);

    try {
      const addressData = {
        ...input,
        createdAt: new Date().toISOString(),
      };

      // If default, unset other defaults
      if (input.isDefault) {
          const batch = db.batch();
          const snapshot = await db.collection("users").doc(user.id).collection("addresses").where("isDefault", "==", true).get();
          snapshot.forEach(doc => {
              batch.update(doc.ref, { isDefault: false });
          });
          await batch.commit();
      }

      const docRef = await db.collection("users")
        .doc(user.id)
        .collection("addresses")
        .add(addressData);

      return { id: docRef.id, ...addressData };

    } catch (error) {
      console.error("[User] Add Address Failed:", error);
      throw new Error("Failed to add address");
    }
  });
