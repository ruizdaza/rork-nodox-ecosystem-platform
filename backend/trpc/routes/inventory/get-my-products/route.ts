import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export const getMyProductsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(50),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;

    console.log(`[Inventory] Fetching products for seller: ${user.id}`);

    try {
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("sellerId", "==", user.id),
        orderBy("createdAt", "desc") // Requires composite index in Firestore potentially, or manual sort if dataset small
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return products;

    } catch (error) {
      console.error("[Inventory] Fetch My Products Failed:", error);
      throw new Error("Failed to fetch products");
    }
  });
