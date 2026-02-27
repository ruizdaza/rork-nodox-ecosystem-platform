import { protectedProcedure } from "@/backend/trpc/create-context";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "@/lib/firebase-server";

// Reusing middleware logic or importing if centralized
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const userDoc = await db.collection("users").doc(ctx.user.id).get();
  const userData = userDoc.data();
  if (!userData?.roles?.includes('admin')) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next();
});

export const getPendingAlliesProcedure = adminProcedure
  .input(z.object({}))
  .query(async () => {
    try {
      const snapshot = await db.collection("users")
        .where("allyStatus", "==", "pending")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("[Admin] Get Pending Allies Failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });

export const manageAllyProcedure = adminProcedure
  .input(z.object({
    userId: z.string(),
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, action, reason } = input;

    try {
      const userRef = db.collection("users").doc(userId);

      const updateData: any = {
          allyStatus: action === 'approve' ? 'approved' : 'rejected',
          allyStatusUpdatedAt: new Date().toISOString()
      };

      if (action === 'approve') {
          // Add 'ally' role if not present
          const userDoc = await userRef.get();
          const currentRoles = userDoc.data()?.roles || [];
          if (!currentRoles.includes('ally')) {
              updateData.roles = [...currentRoles, 'ally'];
          }
          updateData.isAlly = true;
      }

      if (reason) {
          updateData.allyRejectionReason = reason;
      }

      await userRef.update(updateData);
      return { success: true };

    } catch (error) {
      console.error("[Admin] Manage Ally Failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  });
