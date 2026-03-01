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
      const orderRef = db.collection("orders").doc(orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
          throw new Error("Order not found");
      }

      const orderData = orderDoc.data();

      // Authorization Check (IDOR prevention)
      if (!orderData?.sellerIds?.includes(user.id) && !user.roles?.includes('admin')) {
          throw new Error("Unauthorized to modify this order");
      }

      await orderRef.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };

    } catch (error) {
      console.error("[Inventory] Update Order Failed:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update order");
    }
  });
