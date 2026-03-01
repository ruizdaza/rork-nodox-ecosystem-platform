import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const getAllyOrdersProcedure = protectedProcedure
  .input(z.object({
    status: z.enum(['pending', 'completed', 'shipped', 'delivered', 'cancelled']).optional(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    console.log(`[Inventory] Fetching orders for seller: ${user.id}`);

    try {
      let query = db.collection("orders")
        .where("sellerIds", "array-contains", user.id);

      if (input.status) {
        query = query.where("status", "==", input.status);
      }

      const snapshot = await query
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const orders: any[] = [];

      snapshot.forEach(doc => {
          const orderData = doc.data();
          // Filter items to only show the ones belonging to this specific seller
          const myItems = orderData.items?.filter((item: any) => item.sellerId === user.id) || [];

          if (myItems.length > 0) {
              orders.push({
                  id: doc.id,
                  ...orderData,
                  items: myItems, // Override order items to only show this seller's subset
                  // Calculate total specific to this seller's items in the order
                  total: myItems.reduce((acc: number, item: any) => acc + (item.pricePaid * item.quantity), 0)
              });
          }
      });

      return orders;

    } catch (error) {
      console.error("[Inventory] Fetch Ally Orders Failed:", error);
      throw new Error("Failed to fetch orders");
    }
  });
