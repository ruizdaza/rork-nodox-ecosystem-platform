import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

// Middleware for Admin check
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.type !== 'admin' && !ctx.user.roles?.includes('admin')) {
    // Check Firestore if role not in token claim yet
    const userDoc = await db.collection("users").doc(ctx.user.id).get();
    const userData = userDoc.data();
    if (!userData?.roles?.includes('admin')) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
  }
  return next();
});

export const getDashboardStatsProcedure = adminProcedure
  .input(z.object({}))
  .query(async () => {
    try {
      // Aggregation queries (requires indices or careful usage)
      // For MVP, we might count manually or use counters if implemented.
      // Firestore count() is efficient.

      const usersCount = (await db.collection("users").count().get()).data().count;
      const productsCount = (await db.collection("products").count().get()).data().count;
      const ordersCount = (await db.collection("orders").count().get()).data().count;

      // Calculate Financials (Heavy operation, should be pre-calculated in real app)
      // We will fetch recent orders to estimate or use a global 'stats' document
      // For this implementation, let's assume we maintain a 'stats/global' doc or calc on fly
      // creating a stats doc is better pattern.
      // Fallback: Read last 100 orders to show volume
      const recentOrders = await db.collection("orders").orderBy("createdAt", "desc").limit(100).get();

      let totalVolumeNcop = 0;
      let totalVolumeCop = 0;

      recentOrders.forEach(doc => {
          const d = doc.data();
          totalVolumeNcop += d.totalPaidNCOP || 0;
          totalVolumeCop += d.totalPaidCOP || 0;
      });

      return {
        usersCount,
        productsCount,
        ordersCount,
        recentVolume: {
            ncop: totalVolumeNcop,
            cop: totalVolumeCop
        }
      };

    } catch (error) {
      console.error("[Admin] Stats Failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });
