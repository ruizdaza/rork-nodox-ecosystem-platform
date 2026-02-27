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
      const snapshot = await db.collection("orders")
        .orderBy("createdAt", "desc")
        .limit(100) // Safety limit
        .get();

      const orders: any[] = [];

      // In-memory filter as fallback for lack of "array-contains" denormalization on Order
      // Ideally: orders.where('sellerIds', 'array-contains', user.id)

      const myProductIds = new Set();
      const productsSnap = await db.collection("products").where("sellerId", "==", user.id).get();
      productsSnap.forEach(doc => myProductIds.add(doc.id));

      snapshot.forEach(doc => {
          const orderData = doc.data();
          const myItems = orderData.items?.filter((item: any) => myProductIds.has(item.productId)) || [];

          if (myItems.length > 0) {
              // Optional: Filter by status if provided
              if (input.status && orderData.status !== input.status) return;

              orders.push({
                  id: doc.id,
                  ...orderData,
                  items: myItems,
                  total: myItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
              });
          }
      });

      return orders;

    } catch (error) {
      console.error("[Inventory] Fetch Ally Orders Failed:", error);
      throw new Error("Failed to fetch orders");
    }
  });
