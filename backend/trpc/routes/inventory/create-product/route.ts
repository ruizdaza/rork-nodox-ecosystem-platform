import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase-server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createProductProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0),
    ncopPrice: z.number().optional().default(0), // NCOP price can be auto-calculated or manual
    category: z.string(),
    images: z.array(z.string()).min(1),
    stock: z.number().min(0),
    isService: z.boolean().default(false),
    duration: z.number().optional(), // For services
  }))
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;

    // Optional: Check if user is an ally (role check)
    // if (!user.roles.includes('ally')) { ... }

    console.log(`[Inventory] Creating product for seller ${user.id}: ${input.name}`);

    try {
      const productData = {
        ...input,
        sellerId: user.id,
        sellerName: user.name || "Vendedor", // Ideally fetch latest name or store in user context
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(), // Use ISO string for consistency with client types
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      const docRef = await addDoc(collection(db, "products"), productData);

      console.log(`[Inventory] Product created with ID: ${docRef.id}`);

      return {
        id: docRef.id,
        ...productData,
      };

    } catch (error) {
      console.error("[Inventory] Create Product Failed:", error);
      throw new Error("Failed to create product");
    }
  });
