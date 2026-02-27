import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

// Simple type for response since we don't have global type defs for Order yet
export const getAllyOrdersProcedure = protectedProcedure
  .input(z.object({
    status: z.enum(['pending', 'completed', 'shipped', 'cancelled']).optional(),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    console.log(`[Inventory] Fetching orders for seller: ${user.id}`);

    try {
      // In Firestore, querying nested arrays (items.sellerId) efficiently requires
      // either an "array-contains" query if we structure it right, or a collection group query on 'items'.
      // For this MVP, assuming 'orders' collection structure from process-order:
      // items: [{ productId, ... }] -> We need to check products.sellerId.
      // BUT process-order didn't save sellerId in items explicitly (it just had productId).
      // Optimization: We should query orders that *contain* products owned by this seller.
      //
      // Approach A: Store sellerId in order items during checkout (Best for scalability).
      // Approach B: Fetch all orders and filter (BAD for scale).
      // Approach C: Since we didn't add sellerId to items in process-order yet, we might need to
      // update process-order OR do a workaround.

      // Let's rely on a simplified assumption: orders collection will be queried.
      // Ideally, `processOrder` should have saved `sellerId` in the items.
      // Let's assume we can fetch all orders for now (since we are just starting) OR
      // filter by user if they are buyers. But this is for SELLERS.

      // CORRECT FIX: We must filter orders where at least one item belongs to the seller.
      // Since we can't easily join in Firestore, we should have indexed this.
      // For this task, I will implement a basic query that might be inefficient but functional,
      // or assume the frontend calls this and we filter in memory after fetching recent orders.

      const ordersRef = collection(db, "orders");
      // Getting ALL orders is too heavy.
      // Let's query orders created recently?
      // Better: In a real app, we'd denormalize "sellerIds" array on the order document.

      const q = query(ordersRef, orderBy("createdAt", "desc")); // Limit this?
      const snapshot = await getDocs(q);

      const orders = [];

      // Helper to check product ownership (naive)
      // Since we don't have sellerId on items in the order doc yet,
      // we'd have to look up every product. That's too slow.
      // CHANGE: I'll update the return to be empty or mock if we can't efficiently query,
      // BUT the user wants "Real Functionality".
      //
      // BEST PATH: I will assume that going forward, we will add sellerId to items.
      // For now, I will return orders that match.
      // Wait, let's look at `processOrder`. It saves `items`.
      // Let's add `sellerId` to items in `processOrder`? No, that's a different file.
      // I'll implement the logic assuming we can filter in memory for the MVP
      // (expecting low volume initially).

      // Fetching my products first to get IDs
      const productsRef = collection(db, "products");
      const productsQ = query(productsRef, where("sellerId", "==", user.id));
      const productsSnap = await getDocs(productsQ);
      const myProductIds = new Set(productsSnap.docs.map(d => d.id));

      for (const doc of snapshot.docs) {
          const orderData = doc.data();
          // Check if any item in this order is one of my products
          const myItems = orderData.items?.filter((item: any) => myProductIds.has(item.productId)) || [];

          if (myItems.length > 0) {
              orders.push({
                  id: doc.id,
                  ...orderData,
                  items: myItems, // Only show my items? Or all? Usually my items.
                  total: myItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
              });
          }
      }

      return orders;

    } catch (error) {
      console.error("[Inventory] Fetch Ally Orders Failed:", error);
      throw new Error("Failed to fetch orders");
    }
  });
