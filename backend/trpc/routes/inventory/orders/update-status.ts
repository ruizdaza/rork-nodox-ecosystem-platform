import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const updateOrderStatusProcedure = protectedProcedure
  .input(z.object({
    orderId: z.string(),
    status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']),
  }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { orderId, status } = input;

    console.log(`[Inventory] Updating order ${orderId} to ${status} by ${user.id}`);

    try {
      await db.collection("orders").doc(orderId).update({
        status,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };

    } catch (error) {
      console.error("[Inventory] Update Order Failed:", error);
      throw new Error("Failed to update order");
    }
  });
