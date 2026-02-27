import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const deleteAddressProcedure = protectedProcedure
  .input(z.object({
    addressId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { addressId } = input;

    try {
      await db.collection("users")
        .doc(user.id)
        .collection("addresses")
        .doc(addressId)
        .delete();

      return { success: true };

    } catch (error) {
      console.error("[User] Delete Address Failed:", error);
      throw new Error("Failed to delete address");
    }
  });
