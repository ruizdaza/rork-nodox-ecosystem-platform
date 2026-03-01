import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

export const getMyProductsProcedure = protectedProcedure
  .input(z.object({
    limit: z.number().default(50),
  }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;

    console.log(`[Inventory] Fetching products for seller: ${user.id}`);

    try {
      const productsSnapshot = await db.collection("products")
        .where("sellerId", "==", user.id)
        .orderBy("createdAt", "desc")
        .limit(input.limit)
        .get();

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return products;

    } catch (error) {
      console.error("[Inventory] Fetch My Products Failed:", error);
      throw new Error("Failed to fetch products");
    }
  });
